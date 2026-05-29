package actions

import (
	"bufio"
	"fmt"
	"os/exec"

	tea "github.com/charmbracelet/bubbletea"
)

// SSHTarget describes a remote machine connection.
type SSHTarget struct {
	Name      string
	Host      string
	User      string
	Password  string
	JumpHost  string
	JumpUser  string
	Port      int
	UseGcloud bool
}

// Targets returns the three predefined SSH targets.
func Targets() []SSHTarget {
	return []SSHTarget{
		{
			Name:     "Onprem Jump",
			Host:     "10.184.120.48",
			User:     "qa",
			Password: "M@nsek.1234",
			JumpHost: "10.82.15.72",
			JumpUser: "qa",
			Port:     22,
		},
		{
			Name:      "GCP Cloud IAP",
			UseGcloud: true,
		},
		{
			Name:     "Local Sandbox",
			Host:     "127.0.0.1",
			User:     "qa",
			Password: "M@nsek.1234",
			Port:     2222,
		},
	}
}

// ConnectCmd builds an SSH/gcloud command and streams output to logChan.
// remoteCmd is optional; if empty the connection is interactive (not recommended for TUI).
func ConnectCmd(target SSHTarget, remoteCmd string, logChan chan string) tea.Cmd {
	return func() tea.Msg {
		logChan <- fmt.Sprintf("[ssh] connecting to %s …", target.Name)

		var cmd *exec.Cmd

		if target.UseGcloud {
			args := []string{
				"compute", "ssh",
				"--zone", "asia-southeast2-c",
				"vm-pt-ksix-0",
				"--tunnel-through-iap",
				"--project", "compute-pt",
			}
			if remoteCmd != "" {
				args = append(args, "--", remoteCmd)
			}
			cmd = exec.Command("gcloud", args...)
		} else {
			hasSshpass := false
			if _, err := exec.LookPath("sshpass"); err == nil {
				hasSshpass = true
			}

			// Build jump proxy if configured
			var args []string
			if hasSshpass && target.Password != "" {
				args = append(args, "-p", target.Password)
			}

			sshArgs := []string{
				"-o", "StrictHostKeyChecking=no",
				"-o", "ConnectTimeout=10",
				"-p", fmt.Sprintf("%d", target.Port),
			}

			if target.JumpHost != "" {
				proxyJump := fmt.Sprintf("%s@%s", target.JumpUser, target.JumpHost)
				sshArgs = append(sshArgs, "-J", proxyJump)
			}

			sshArgs = append(sshArgs, fmt.Sprintf("%s@%s", target.User, target.Host))

			if remoteCmd != "" {
				sshArgs = append(sshArgs, remoteCmd)
			}

			if hasSshpass && target.Password != "" {
				cmd = exec.Command("sshpass", append(args, append([]string{"ssh"}, sshArgs...)...)...)
			} else {
				cmd = exec.Command("ssh", sshArgs...)
			}
		}

		go streamCmd(cmd, logChan)
		return ActionStartMsg{Label: "SSH: " + target.Name}
	}
}

// streamCmd runs cmd and writes stdout/stderr lines to logChan, then sends exit sentinel.
func streamCmd(cmd *exec.Cmd, logChan chan string) {
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		logChan <- fmt.Sprintf("[error] stdout pipe: %v", err)
		logChan <- "__EXIT__1"
		return
	}
	stderr, err := cmd.StderrPipe()
	if err != nil {
		logChan <- fmt.Sprintf("[error] stderr pipe: %v", err)
		logChan <- "__EXIT__1"
		return
	}

	if err := cmd.Start(); err != nil {
		logChan <- fmt.Sprintf("[error] start: %v", err)
		logChan <- "__EXIT__1"
		return
	}

	// Drain stdout
	go func() {
		sc := bufio.NewScanner(stdout)
		for sc.Scan() {
			logChan <- sc.Text()
		}
	}()

	// Drain stderr
	sc := bufio.NewScanner(stderr)
	for sc.Scan() {
		logChan <- "[stderr] " + sc.Text()
	}

	err = cmd.Wait()
	code := 0
	if err != nil {
		if exitErr, ok := err.(*exec.ExitError); ok {
			code = exitErr.ExitCode()
		} else {
			code = 1
		}
	}
	logChan <- fmt.Sprintf("__EXIT__%d", code)
}
