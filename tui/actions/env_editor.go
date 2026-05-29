package actions

import (
	"path/filepath"

	"mostngk6x/tui/utils"
)

// EnvPath returns the canonical path to local.env.
func EnvPath(projectDir string) string {
	return filepath.Join(projectDir, "docker-local-pt", "configs", "local.env")
}

// ReadEnv reads and parses the local.env file.
func ReadEnv(path string) (map[string]string, error) {
	return utils.Parse(path)
}

// WriteEnvKey updates or appends a key in the env file.
func WriteEnvKey(path, key, value string) error {
	return utils.Write(path, key, value)
}
