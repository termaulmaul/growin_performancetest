package main

import (
	"os"
	"os/exec"
	"path/filepath"

	"mostngk6x/tui/actions"
	"mostngk6x/tui/utils"

	tea "github.com/charmbracelet/bubbletea"
)

// Update processes all incoming messages and returns the updated model and next command.
func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {

	case tea.WindowSizeMsg:
		m.width = msg.Width
		m.height = msg.Height
		// Resize preview viewport
		sideW := msg.Width * 22 / 100
		prevW := msg.Width * 34 / 100
		mainW := msg.Width - sideW - prevW - 6
		_ = mainW
		m.preview.Resize(prevW, msg.Height-3)
		return m, nil

	case initialDataMsg:
		m.suites = msg.suites
		m.envVars = msg.envVars
		m.mainPanel.SetSuites(msg.suites)
		m.mainPanel.SetContext(m.sidebar.Selected(), m.envVars, m.suites)
		return m, nil

	case actions.LogLineMsg:
		m.logLines = append(m.logLines, msg.Line)
		m.preview.AppendLine(msg.Line)
		return m, actions.WaitForLine(m.logChan)

	case actions.ProcessDoneMsg:
		m.running = false
		if msg.ExitCode == 0 {
			m.status = "PASS"
			m.preview.SetStatus("PASS")
		} else {
			m.status = "FAIL"
			m.preview.SetStatus("FAIL")
		}
		return m, nil

	case actions.ActionStartMsg:
		m.running = true
		m.lastAction = msg.Label
		m.status = "RUNNING"
		m.logLines = nil
		m.preview.ClearLines()
		m.preview.SetStatus("RUNNING")
		// Switch focus to preview so user can watch logs
		m.activePanel = 2
		return m, actions.WaitForLine(m.logChan)

	case scenariosLoadedMsg:
		m.mainPanel.SetScenarios(msg.scenarios)
		return m, nil

	case reportsLoadedMsg:
		m.mainPanel.SetReports(msg.reports)
		return m, nil

	case envReloadedMsg:
		if msg.err == nil && msg.envVars != nil {
			m.envVars = msg.envVars
			m.mainPanel.SetContext(m.sidebar.Selected(), m.envVars, m.suites)
		}
		return m, nil

	case tea.KeyMsg:
		return m.handleKey(msg)
	}

	return m, nil
}

func (m Model) handleKey(msg tea.KeyMsg) (tea.Model, tea.Cmd) {
	// Quit modal
	if m.showQuitModal {
		switch msg.String() {
		case "y", "Y":
			return m, tea.Quit
		case "n", "N", "esc":
			m.showQuitModal = false
		}
		return m, nil
	}

	// up/down isolated to focused panel
	switch msg.String() {
	case "up", "down", "k", "j":
		switch m.activePanel {
		case 0:
			return m.handleSidebarKey(msg)
		case 1:
			m.mainPanel.Update(msg)
			if m.sidebar.Selected().Section == "RunTest" {
				return m, m.loadScenarios()
			}
			return m, nil
		case 2:
			m.preview.Update(msg)
			return m, nil
		}
	}

	// Tab/Shift+Tab: cycle form fields when RunTest focused, else switch panels
	switch msg.String() {
	case "tab":
		if m.activePanel == 1 && m.sidebar.Selected().Section == "RunTest" {
			m.mainPanel.Update(msg)
			return m, nil
		}
		m.activePanel = (m.activePanel + 1) % 3
		return m, nil
	case "shift+tab":
		if m.activePanel == 1 && m.sidebar.Selected().Section == "RunTest" {
			m.mainPanel.Update(msg)
			return m, nil
		}
		m.activePanel = (m.activePanel + 2) % 3
		return m, nil
	}

	// Global shortcuts
	switch msg.String() {
	case "q":
		m.showQuitModal = true
		return m, nil

	case "left", "h":
		m.activePanel = (m.activePanel + 2) % 3
		return m, nil

	case "right", "l":
		m.activePanel = (m.activePanel + 1) % 3
		return m, nil

	case "e":
		m.sidebar.SetCursorByAction("env_edit")
		m.activePanel = 1
		m.mainPanel.SetContext(m.sidebar.Selected(), m.envVars, m.suites)
		return m, nil

	case "s":
		m.sidebar.SetCursorBySection("SSH")
		m.activePanel = 0
		m.mainPanel.SetContext(m.sidebar.Selected(), m.envVars, m.suites)
		return m, nil

	case "d":
		return m.handleDockerToggle()

	case "r":
		if m.lastAction != "" && !m.running {
			return m.rerunLastAction()
		}
		return m, nil
	}

	// Panel-specific delegation
	switch m.activePanel {
	case 0:
		return m.handleSidebarKey(msg)
	case 1:
		m.mainPanel.Update(msg)
		return m, nil
	case 2:
		m.preview.Update(msg)
		return m, nil
	}

	return m, nil
}

func (m Model) handleSidebarKey(msg tea.KeyMsg) (tea.Model, tea.Cmd) {
	switch msg.String() {
	case "enter":
		return m.executeSelected()
	case "up", "down", "k", "j":
		m.sidebar.Update(msg)
		m.mainPanel.SetContext(m.sidebar.Selected(), m.envVars, m.suites)
		// If RunTest selected, load scenarios for current suite
		if m.sidebar.Selected().Section == "RunTest" {
			return m, m.loadScenarios()
		}
		return m, nil
	default:
		m.sidebar.Update(msg)
		m.mainPanel.SetContext(m.sidebar.Selected(), m.envVars, m.suites)
	}
	return m, nil
}

func (m Model) executeSelected() (tea.Model, tea.Cmd) {
	sel := m.sidebar.Selected()
	composeDir := filepath.Join(m.projectDir, "docker-local-pt")

	switch sel.Action {
	case "ssh_onprem":
		targets := actions.Targets()
		return m, actions.ConnectCmd(targets[0], "uptime && df -h", m.logChan)
	case "ssh_gcp":
		targets := actions.Targets()
		return m, actions.ConnectCmd(targets[1], "uptime && df -h", m.logChan)
	case "ssh_local":
		targets := actions.Targets()
		return m, actions.ConnectCmd(targets[2], "uptime && df -h", m.logChan)

	case "docker_start":
		return m, actions.StartStack(composeDir, m.logChan)
	case "docker_obs":
		return m, actions.StartObservability(composeDir, m.logChan)
	case "docker_stop":
		return m, actions.StopStack(composeDir, m.logChan)
	case "docker_status":
		return m, actions.StatusCmd(composeDir, m.logChan)

	case "run_suite":
		suite, _, platform, _ := m.mainPanel.GetRunParams()
		if suite != "" {
			return m, actions.RunMockSuite(m.projectDir, suite, platform, m.logChan)
		}

	case "run_scenario":
		suite, scenario, platform, variant := m.mainPanel.GetRunParams()
		if suite != "" && scenario != "" {
			return m, actions.RunMockScenario(m.projectDir, suite, scenario, platform, variant, m.logChan)
		}

	case "env_edit":
		return m, m.openEnvEditor()

	case "report_list":
		return m, m.listReports()
	}

	return m, nil
}

func (m Model) handleDockerToggle() (tea.Model, tea.Cmd) {
	composeDir := filepath.Join(m.projectDir, "docker-local-pt")
	if m.running {
		return m, actions.StopStack(composeDir, m.logChan)
	}
	return m, actions.StartStack(composeDir, m.logChan)
}

func (m Model) rerunLastAction() (tea.Model, tea.Cmd) {
	// Re-execute the sidebar selection
	return m.executeSelected()
}

func (m Model) loadScenarios() tea.Cmd {
	suite, _, _, _ := m.mainPanel.GetRunParams()
	if suite == "" {
		return nil
	}
	suiteDir := filepath.Join(m.projectDir, "Script", suite)
	return func() tea.Msg {
		scenarios, _ := utils.ScanScenarios(suiteDir)
		return scenariosLoadedMsg{scenarios: scenarios}
	}
}

type scenariosLoadedMsg struct {
	scenarios []string
}

func (m Model) openEnvEditor() tea.Cmd {
	envPath := actions.EnvPath(m.projectDir)
	editor := os.Getenv("EDITOR")
	if editor == "" {
		editor = "vi"
	}
	c := exec.Command(editor, envPath)
	return tea.ExecProcess(c, func(err error) tea.Msg {
		// Reload env after editor closes
		envVars, _ := actions.ReadEnv(envPath)
		return envReloadedMsg{envVars: envVars, err: err}
	})
}

type envReloadedMsg struct {
	envVars map[string]string
	err     error
}

func (m Model) listReports() tea.Cmd {
	reportDir := filepath.Join(m.projectDir, "Report")
	return func() tea.Msg {
		entries, err := os.ReadDir(reportDir)
		if err != nil {
			return reportsLoadedMsg{reports: nil}
		}
		var reports []string
		for _, e := range entries {
			reports = append(reports, e.Name())
		}
		return reportsLoadedMsg{reports: reports}
	}
}

type reportsLoadedMsg struct {
	reports []string
}
