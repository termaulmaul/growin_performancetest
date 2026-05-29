package panels

import (
	"fmt"
	"strings"

	"mostngk6x/tui/styles"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

// RunTestForm holds user selections for the Run Test context.
type RunTestForm struct {
	Suites    []string
	Scenarios []string
	SuiteIdx  int
	ScenIdx   int
	Platform  string // Web | Android | iOS
	Variant   string // original | enchange
	Field     int    // 0=suite 1=scenario 2=platform 3=variant
}

// MainPanel renders context-sensitive content based on the selected sidebar item.
type MainPanel struct {
	selected MenuItem
	envVars  map[string]string
	reports  []string
	form     RunTestForm
	logLines []string
}

// NewMainPanel creates a MainPanel.
func NewMainPanel() MainPanel {
	return MainPanel{
		form: RunTestForm{
			Platform: "Web",
			Variant:  "original",
		},
	}
}

// SetContext updates what the panel should display.
func (m *MainPanel) SetContext(item MenuItem, envVars map[string]string, suites []string) {
	m.selected = item
	m.envVars = envVars
	if len(suites) > 0 && len(m.form.Suites) == 0 {
		m.form.Suites = suites
	}
}

// SetReports sets the list of report files.
func (m *MainPanel) SetReports(reports []string) {
	m.reports = reports
}

// SetSuites updates the suite list (called after scan).
func (m *MainPanel) SetSuites(suites []string) {
	m.form.Suites = suites
}

// SetScenarios updates scenario list for the selected suite.
func (m *MainPanel) SetScenarios(scenarios []string) {
	m.form.Scenarios = scenarios
	m.form.ScenIdx = 0
}

// GetRunParams returns (suite, scenario, platform, variant) for the run form.
func (m MainPanel) GetRunParams() (string, string, string, string) {
	suite := ""
	scenario := ""
	if m.form.SuiteIdx < len(m.form.Suites) {
		suite = m.form.Suites[m.form.SuiteIdx]
	}
	if m.form.ScenIdx < len(m.form.Scenarios) {
		scenario = m.form.Scenarios[m.form.ScenIdx]
	}
	return suite, scenario, m.form.Platform, m.form.Variant
}

// Update handles key events for the main panel.
func (m *MainPanel) Update(msg tea.Msg) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch m.selected.Section {
		case "RunTest":
			m.handleRunTestKey(msg)
		case "ENV":
			m.handleENVKey(msg)
		}
	}
}

func (m *MainPanel) handleRunTestKey(msg tea.KeyMsg) {
	switch msg.String() {
	case "tab":
		m.form.Field = (m.form.Field + 1) % 4
	case "shift+tab":
		m.form.Field = (m.form.Field + 3) % 4
	case "up", "k":
		switch m.form.Field {
		case 0:
			if m.form.SuiteIdx > 0 {
				m.form.SuiteIdx--
			}
		case 1:
			if m.form.ScenIdx > 0 {
				m.form.ScenIdx--
			}
		case 2:
			m.cyclePlatform(-1)
		case 3:
			m.cycleVariant(-1)
		}
	case "down", "j":
		switch m.form.Field {
		case 0:
			if m.form.SuiteIdx < len(m.form.Suites)-1 {
				m.form.SuiteIdx++
			}
		case 1:
			if m.form.ScenIdx < len(m.form.Scenarios)-1 {
				m.form.ScenIdx++
			}
		case 2:
			m.cyclePlatform(1)
		case 3:
			m.cycleVariant(1)
		}
	}
}

func (m *MainPanel) cyclePlatform(dir int) {
	platforms := []string{"Web", "Android", "iOS"}
	idx := 0
	for i, p := range platforms {
		if p == m.form.Platform {
			idx = i
			break
		}
	}
	idx = (idx + dir + len(platforms)) % len(platforms)
	m.form.Platform = platforms[idx]
}

func (m *MainPanel) cycleVariant(dir int) {
	variants := []string{"original", "enchange"}
	idx := 0
	for i, v := range variants {
		if v == m.form.Variant {
			idx = i
			break
		}
	}
	idx = (idx + dir + len(variants)) % len(variants)
	m.form.Variant = variants[idx]
}

func (m *MainPanel) handleENVKey(msg tea.KeyMsg) {
	// Placeholder: full interactive editing would need a text input widget
	_ = msg
}

// View renders the main panel content.
func (m MainPanel) View(width, height int, active bool) string {
	borderStyle := styles.PanelBorder
	if active {
		borderStyle = styles.PanelBorderActive
	}

	title := styles.TitleStyle.Render(fmt.Sprintf(" %s ", m.panelTitle()))
	body := m.renderBody(width - 6)

	content := title + "\n\n" + body

	return borderStyle.
		Width(width - 2).
		Height(height - 2).
		Render(content)
}

func (m MainPanel) panelTitle() string {
	switch m.selected.Section {
	case "SSH":
		return "SSH"
	case "Docker":
		return "DOCKER"
	case "RunTest":
		return "RUN TEST"
	case "ENV":
		return "ENV"
	case "Report":
		return "REPORTS"
	default:
		return "MAIN"
	}
}

func (m MainPanel) renderBody(width int) string {
	switch m.selected.Section {
	case "SSH":
		return m.renderSSH(width)
	case "Docker":
		return m.renderDocker(width)
	case "RunTest":
		return m.renderRunTest(width)
	case "ENV":
		return m.renderENV(width)
	case "Report":
		return m.renderReports(width)
	default:
		return styles.MutedText.Render("Select an option from the sidebar.")
	}
}

func (m MainPanel) renderSSH(width int) string {
	targets := []struct {
		name string
		desc string
	}{
		{"Onprem Jump", "qa@10.184.120.48 via jump 10.82.15.72"},
		{"GCP Cloud IAP", "gcloud compute ssh vm-pt-ksix-0 (asia-southeast2-c)"},
		{"Local Sandbox", "qa@127.0.0.1 -p 2222"},
	}

	var sb strings.Builder
	sb.WriteString(styles.SectionTitle.Render("Available Targets") + "\n\n")

	for i, t := range targets {
		prefix := "  "
		style := styles.NormalItem
		if m.selected.Action == []string{"ssh_onprem", "ssh_gcp", "ssh_local"}[i] {
			prefix = "▶ "
			style = styles.SelectedItem
		}
		sb.WriteString(style.Render(fmt.Sprintf("%s%s", prefix, t.name)) + "\n")
		sb.WriteString(styles.MutedText.Render(fmt.Sprintf("    %s", t.desc)) + "\n\n")
	}

	sb.WriteString("\n" + styles.MutedText.Render("Press Enter to connect"))
	return sb.String()
}

func (m MainPanel) renderDocker(width int) string {
	actions := []struct {
		action string
		label  string
		desc   string
	}{
		{"docker_start", "Start Stack", "docker compose up -d mock-api"},
		{"docker_obs", "Start + Observability", "docker compose --profile observability up -d"},
		{"docker_stop", "Stop Stack", "docker compose down"},
		{"docker_status", "Status", "docker ps"},
	}

	var sb strings.Builder
	sb.WriteString(styles.SectionTitle.Render("Docker Actions") + "\n\n")

	for _, a := range actions {
		prefix := "  "
		style := styles.NormalItem
		if m.selected.Action == a.action {
			prefix = "▶ "
			style = styles.SelectedItem
		}
		sb.WriteString(style.Render(fmt.Sprintf("%s%s", prefix, a.label)) + "\n")
		sb.WriteString(styles.MutedText.Render(fmt.Sprintf("    %s", a.desc)) + "\n\n")
	}

	sb.WriteString("\n" + styles.MutedText.Render("Press Enter to execute"))
	return sb.String()
}

func (m MainPanel) renderRunTest(width int) string {
	var sb strings.Builder
	sb.WriteString(styles.SectionTitle.Render("Run Configuration") + "\n\n")

	fieldStyle := func(idx int) lipgloss.Style {
		if m.form.Field == idx {
			return styles.SelectedItem
		}
		return styles.NormalItem
	}

	// Suite selector
	suite := "(no suites found)"
	if len(m.form.Suites) > 0 && m.form.SuiteIdx < len(m.form.Suites) {
		suite = m.form.Suites[m.form.SuiteIdx]
	}
	sb.WriteString(fieldStyle(0).Render("Suite:") + "\n")
	sb.WriteString(fmt.Sprintf("  ◀ %s ▶", suite) + "\n")
	if len(m.form.Suites) > 0 {
		sb.WriteString(styles.MutedText.Render(
			fmt.Sprintf("  (%d/%d)", m.form.SuiteIdx+1, len(m.form.Suites))) + "\n")
	}
	sb.WriteString("\n")

	// Scenario selector
	scenario := "(none)"
	if len(m.form.Scenarios) > 0 && m.form.ScenIdx < len(m.form.Scenarios) {
		scenario = m.form.Scenarios[m.form.ScenIdx]
	}
	if m.selected.Action == "run_suite" {
		scenario = "(all scenarios in suite)"
	}
	sb.WriteString(fieldStyle(1).Render("Scenario:") + "\n")
	sb.WriteString(fmt.Sprintf("  ◀ %s ▶", scenario) + "\n\n")

	// Platform
	sb.WriteString(fieldStyle(2).Render("Platform:") + "\n")
	sb.WriteString(fmt.Sprintf("  ◀ %s ▶", m.form.Platform) + "\n\n")

	// Variant
	sb.WriteString(fieldStyle(3).Render("Variant:") + "\n")
	sb.WriteString(fmt.Sprintf("  ◀ %s ▶", m.form.Variant) + "\n\n")

	sb.WriteString(styles.MutedText.Render("Tab=next field  ↑↓=change value  Enter=run"))
	return sb.String()
}

func (m MainPanel) renderENV(width int) string {
	var sb strings.Builder
	sb.WriteString(styles.SectionTitle.Render("local.env Contents") + "\n\n")

	if len(m.envVars) == 0 {
		sb.WriteString(styles.MutedText.Render("(no env vars loaded or file not found)"))
		return sb.String()
	}

	count := 0
	for k, v := range m.envVars {
		if count >= 20 {
			sb.WriteString(styles.MutedText.Render(fmt.Sprintf("… and %d more", len(m.envVars)-count)) + "\n")
			break
		}
		line := fmt.Sprintf("%-24s = %s", k, v)
		if len(line) > width {
			line = line[:width-1] + "…"
		}
		sb.WriteString(styles.NormalItem.Render(line) + "\n")
		count++
	}

	sb.WriteString("\n" + styles.MutedText.Render("Press Enter to open in $EDITOR"))
	return sb.String()
}

func (m MainPanel) renderReports(width int) string {
	var sb strings.Builder
	sb.WriteString(styles.SectionTitle.Render("Available Reports") + "\n\n")

	if len(m.reports) == 0 {
		sb.WriteString(styles.MutedText.Render("(no reports found in Report/)"))
		return sb.String()
	}

	for i, r := range m.reports {
		if i >= 30 {
			sb.WriteString(styles.MutedText.Render(fmt.Sprintf("… and %d more", len(m.reports)-i)))
			break
		}
		sb.WriteString(styles.NormalItem.Render("  "+r) + "\n")
	}

	return sb.String()
}
