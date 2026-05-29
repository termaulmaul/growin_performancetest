package actions

import (
	"fmt"

	tea "github.com/charmbracelet/bubbletea"
)

// LogLineMsg carries a single output line from a running process.
type LogLineMsg struct {
	Line string
}

// ProcessDoneMsg signals a process finished. ExitCode -1 means channel closed unexpectedly.
type ProcessDoneMsg struct {
	ExitCode int
	Err      error
}

// ActionStartMsg signals that a new action has begun.
type ActionStartMsg struct {
	Label string
}

// WaitForLine reads one line from ch and returns it as a LogLineMsg.
// When the channel is closed it returns ProcessDoneMsg with exit code from sentinel.
func WaitForLine(ch chan string) tea.Cmd {
	return func() tea.Msg {
		line, ok := <-ch
		if !ok {
			return ProcessDoneMsg{ExitCode: -1}
		}
		// Sentinel "__EXIT__<code>" written by process helpers when done.
		if len(line) > 8 && line[:8] == "__EXIT__" {
			code := 0
			_, err := fmt.Sscanf(line[8:], "%d", &code)
			if err != nil {
				code = 1
			}
			return ProcessDoneMsg{ExitCode: code}
		}
		return LogLineMsg{Line: line}
	}
}
