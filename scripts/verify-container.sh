#!/bin/sh
# Read-only verification of this Compose project's running container.
set -eu
cd "$(dirname "$0")/.."
fail() { printf '%s\n' "$*" >&2; exit 1; }
command -v docker >/dev/null 2>&1 || fail 'Docker CLI is required.'
command -v curl >/dev/null 2>&1 || fail 'curl is required.'
project_name=${1:-betterpililla}
docker compose --project-name "$project_name" --file compose.yaml config --quiet
container_id=$(docker compose --project-name "$project_name" --file compose.yaml ps -q web)
[ -n "$container_id" ] || fail 'This project has no running web container.'
[ "$(docker inspect --format '{{.State.Running}}' "$container_id")" = true ] || fail 'Container is not running.'
[ "$(docker inspect --format '{{.State.Health.Status}}' "$container_id")" = healthy ] || fail 'Container is not healthy.'
[ "$(docker inspect --format '{{.Config.User}}' "$container_id")" = 101 ] || fail 'Expected unprivileged UID 101.'
[ "$(docker inspect --format '{{.HostConfig.ReadonlyRootfs}}' "$container_id")" = true ] || fail 'Root filesystem is writable.'
caps=$(docker inspect --format '{{range .HostConfig.CapDrop}}{{.}} {{end}}' "$container_id")
case "$caps" in *ALL*) ;; *) fail 'Linux capabilities are not all dropped.' ;; esac
options=$(docker inspect --format '{{range .HostConfig.SecurityOpt}}{{.}} {{end}}' "$container_id")
case " $options " in *' no-new-privileges:true '*|*' no-new-privileges '*) ;; *) fail 'Privilege escalation protection is missing.' ;; esac
mounts=$(docker inspect --format '{{range .Mounts}}{{if ne .Type "tmpfs"}}{{.Type}}:{{.Destination}} {{end}}{{end}}' "$container_id")
[ -z "$mounts" ] || fail "Unexpected persistent/shared mount: $mounts"
project=$(docker inspect --format '{{index .Config.Labels "com.docker.compose.project"}}' "$container_id")
[ -n "$project" ] || fail 'Compose project label is missing.'
network=$(docker inspect --format '{{range $name, $value := .NetworkSettings.Networks}}{{$name}}{{end}}' "$container_id")
[ "$network" = "${project}_site" ] || fail "Unexpected container network: $network"
[ "$(docker inspect --format '{{.HostConfig.Memory}}' "$container_id")" -gt 0 ] || fail 'Memory limit is missing.'
[ "$(docker inspect --format '{{.HostConfig.NanoCpus}}' "$container_id")" -gt 0 ] || fail 'CPU limit is missing.'
[ "$(docker inspect --format '{{.HostConfig.PidsLimit}}' "$container_id")" -gt 0 ] || fail 'Process limit is missing.'
binding=$(docker inspect --format '{{range (index .NetworkSettings.Ports "8080/tcp")}}{{.HostIp}}:{{.HostPort}}{{end}}' "$container_id")
case "$binding" in 127.0.0.1:*) ;; *) fail "Expected loopback-only port mapping, got: $binding" ;; esac
port=${binding##*:}
case "$port" in ''|*[!0-9]*) fail "Invalid published port: $port" ;; esac
origin="http://127.0.0.1:$port"
health=$(curl -fsS --max-time 10 "$origin/healthz")
[ "$health" = ok ] || fail 'Health endpoint did not return ok.'
check_content() {
    response=$(curl -fsS --max-time 20 "$origin$1") || fail "Failed to fetch $1"
    case "$response" in *"$2"*) ;; *) fail "Required content missing from $1" ;; esac
}
check_content /en/ '<html'
check_content /fil/ '<html'
check_content /data/services.json '"services"'
check_content /budget-portal/index.html '<html'
printf 'Verified %s: healthy, UID 101, restricted filesystem/capabilities/resources, own network, %s; site and data respond.\n' "$project" "$origin"
