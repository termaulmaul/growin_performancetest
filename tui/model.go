package main

import (
	"os"
	"path/filepath"

	"mostngk6x/tui/actions"
	"mostngk6x/tui/panels"
	"mostngk6x/tui/utils"

	tea "github.com/charmbracelet/bubbletea"
)

// Model is the root application state.
type Model struct {
	width         int
	height        int
	activePanel   int // 0=sidebar, 1=main, 2=preview
	sidebar       panels.Sidebar
	mainPanel     panels.MainPanel
	preview       panels.Preview
	status        string
	logLines      []string
	logChan       chan string
	running       bool
	lastAction    string
	showQuitModal bool
	envVars       map[string]string
	suites        []string
	projectDir    string
}

// Init initialises the model and loads initial data.
func (m Model) Init() tea.Cmd {
	return tea.Batch(
		tea.EnterAltScreen,
		loadInitialData(m.projectDir, m.logChan),
	)
}

// loadInitialData scans suites and env file asynchronously.
func loadInitialData(projectDir string, _ chan string) tea.Cmd {
	return func() tea.Msg {
		suites, _ := utils.ScanSuites(filepath.Join(projectDir, "Script"))
		envPath := actions.EnvPath(projectDir)
		envVars, _ := actions.ReadEnv(envPath)
		return initialDataMsg{suites: suites, envVars: envVars}
	}
}

type initialDataMsg struct {
	suites  []string
	envVars map[string]string
}

// newModel creates the initial Model.
func newModel() Model {
	projectDir, _ := os.Getwd()
	logChan := make(chan string, 256)

	m := Model{
		width:       80,
		height:      24,
		activePanel: 0,
		sidebar:     panels.NewSidebar(),
		mainPanel:   panels.NewMainPanel(),
		preview:     panels.NewPreview(28, 22),
		status:      "IDLE",
		logChan:     logChan,
		projectDir:  projectDir,
	}
	return m
}
