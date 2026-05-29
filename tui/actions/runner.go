package actions

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"

	tea "github.com/charmbracelet/bubbletea"
)

// RunMockSuite runs the full suite sweep script.
func RunMockSuite(projectDir, suite, platform string, logChan chan string) tea.Cmd {
	return func() tea.Msg {
		label := fmt.Sprintf("Mock Suite: %s / %s", suite, platform)
		logChan <- fmt.Sprintf("[runner] starting %s…", label)

		script := filepath.Join(projectDir, "docker-local-pt", "scripts", "run-mock-suite.sh")
		cmd := exec.Command("bash", script, suite, platform)
		cmd.Dir = projectDir
		cmd.Env = append(os.Environ(), "SUITE="+suite)

		go streamCmd(cmd, logChan)
		return ActionStartMsg{Label: label}
	}
}

// RunMockScenario runs a single scenario.
// variant is "original" or "enchange".
func RunMockScenario(projectDir, suite, scenario, platform, variant string, logChan chan string) tea.Cmd {
	return func() tea.Msg {
		label := fmt.Sprintf("Mock Scenario: %s / %s / %s [%s]", suite, scenario, platform, variant)
		logChan <- fmt.Sprintf("[runner] starting %s…", label)

		script := filepath.Join(projectDir, "docker-local-pt", "scripts", "run-mock-scenario.sh")
		cmd := exec.Command("bash", script, scenario, platform, variant)
		cmd.Dir = projectDir
		cmd.Env = append(os.Environ(), "SUITE="+suite)

		go streamCmd(cmd, logChan)
		return ActionStartMsg{Label: label}
	}
}
