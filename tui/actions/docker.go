package actions

import (
	"fmt"
	"os/exec"
	"path/filepath"

	tea "github.com/charmbracelet/bubbletea"
)

func composeEnvFile(composeDir string) string {
	return filepath.Join(composeDir, "configs", "local.env")
}

// StartStack starts the mock-api service.
func StartStack(composeDir string, logChan chan string) tea.Cmd {
	return func() tea.Msg {
		logChan <- "[docker] starting stack (mock-api)…"
		cmd := exec.Command(
			"docker", "compose",
			"--env-file", composeEnvFile(composeDir),
			"up", "-d", "mock-api",
		)
		cmd.Dir = composeDir
		go streamCmd(cmd, logChan)
		return ActionStartMsg{Label: "Docker: Start Stack"}
	}
}

// StartObservability starts all services including observability profile.
func StartObservability(composeDir string, logChan chan string) tea.Cmd {
	return func() tea.Msg {
		logChan <- "[docker] starting stack + observability…"
		cmd := exec.Command(
			"docker", "compose",
			"--env-file", composeEnvFile(composeDir),
			"--profile", "observability",
			"up", "-d",
		)
		cmd.Dir = composeDir
		go streamCmd(cmd, logChan)
		return ActionStartMsg{Label: "Docker: Start + Observability"}
	}
}

// StopStack brings the compose stack down.
func StopStack(composeDir string, logChan chan string) tea.Cmd {
	return func() tea.Msg {
		logChan <- "[docker] stopping stack…"
		cmd := exec.Command("docker", "compose", "down")
		cmd.Dir = composeDir
		go streamCmd(cmd, logChan)
		return ActionStartMsg{Label: "Docker: Stop Stack"}
	}
}

// StatusCmd lists running containers.
func StatusCmd(composeDir string, logChan chan string) tea.Cmd {
	return func() tea.Msg {
		logChan <- "[docker] checking container status…"
		cmd := exec.Command(
			"docker", "ps",
			"--format", "{{.Names}}\t{{.Status}}",
		)
		go func() {
			out, err := cmd.Output()
			if err != nil {
				logChan <- fmt.Sprintf("[error] docker ps: %v", err)
				logChan <- "__EXIT__1"
				return
			}
			if len(out) == 0 {
				logChan <- "(no containers running)"
			} else {
				for _, line := range splitLines(string(out)) {
					if line != "" {
						logChan <- line
					}
				}
			}
			logChan <- "__EXIT__0"
		}()
		return ActionStartMsg{Label: "Docker: Status"}
	}
}

func splitLines(s string) []string {
	var out []string
	cur := ""
	for _, c := range s {
		if c == '\n' {
			out = append(out, cur)
			cur = ""
		} else {
			cur += string(c)
		}
	}
	if cur != "" {
		out = append(out, cur)
	}
	return out
}
