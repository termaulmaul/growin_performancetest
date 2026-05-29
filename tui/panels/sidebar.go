package panels

import (
	"fmt"
	"strings"

	"mostngk6x/tui/styles"

	tea "github.com/charmbracelet/bubbletea"
)

// MenuSection groups related items.
type MenuSection struct {
	Title string
	Items []MenuItem
}

// MenuItem is a single selectable entry.
type MenuItem struct {
	Label   string
	Section string
	Action  string
}

// Sidebar renders the left navigation panel.
type Sidebar struct {
	sections []MenuSection
	// flat cursor across all items
	cursor   int
	flatList []MenuItem
}

// NewSidebar creates a Sidebar with the standard menu structure.
func NewSidebar() Sidebar {
	sections := []MenuSection{
		{
			Title: "SSH",
			Items: []MenuItem{
				{Label: "Onprem Jump", Section: "SSH", Action: "ssh_onprem"},
				{Label: "GCP Cloud IAP", Section: "SSH", Action: "ssh_gcp"},
				{Label: "Local Sandbox", Section: "SSH", Action: "ssh_local"},
			},
		},
		{
			Title: "Docker",
			Items: []MenuItem{
				{Label: "Start Stack", Section: "Docker", Action: "docker_start"},
				{Label: "Start + Observability", Section: "Docker", Action: "docker_obs"},
				{Label: "Stop Stack", Section: "Docker", Action: "docker_stop"},
				{Label: "Status", Section: "Docker", Action: "docker_status"},
			},
		},
		{
			Title: "Run Test",
			Items: []MenuItem{
				{Label: "Mock Suite", Section: "RunTest", Action: "run_suite"},
				{Label: "Mock Scenario", Section: "RunTest", Action: "run_scenario"},
			},
		},
		{
			Title: "ENV",
			Items: []MenuItem{
				{Label: "Edit local.env", Section: "ENV", Action: "env_edit"},
			},
		},
		{
			Title: "Report",
			Items: []MenuItem{
				{Label: "List Reports", Section: "Report", Action: "report_list"},
			},
		},
	}

	var flat []MenuItem
	for _, sec := range sections {
		flat = append(flat, sec.Items...)
	}

	return Sidebar{
		sections: sections,
		flatList: flat,
		cursor:   0,
	}
}

// Update handles key messages for the sidebar.
func (s *Sidebar) Update(msg tea.Msg) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.String() {
		case "up", "k":
			if s.cursor > 0 {
				s.cursor--
			}
		case "down", "j":
			if s.cursor < len(s.flatList)-1 {
				s.cursor++
			}
		}
	}
}

// Selected returns the currently highlighted MenuItem.
func (s Sidebar) Selected() MenuItem {
	if s.cursor >= 0 && s.cursor < len(s.flatList) {
		return s.flatList[s.cursor]
	}
	return MenuItem{}
}

// SetCursorByAction moves cursor to the item with the given action string.
func (s *Sidebar) SetCursorByAction(action string) {
	for i, item := range s.flatList {
		if item.Action == action {
			s.cursor = i
			return
		}
	}
}

// SetCursorBySection moves cursor to the first item in the named section.
func (s *Sidebar) SetCursorBySection(section string) {
	for i, item := range s.flatList {
		if item.Section == section {
			s.cursor = i
			return
		}
	}
}

// View renders the sidebar within the given dimensions.
func (s Sidebar) View(width, height int, active bool) string {
	borderStyle := styles.PanelBorder
	if active {
		borderStyle = styles.PanelBorderActive
	}

	inner := width - 4 // account for border + padding
	if inner < 1 {
		inner = 1
	}

	var sb strings.Builder
	sb.WriteString(styles.TitleStyle.Render(" MENU ") + "\n\n")

	flatIdx := 0
	for _, sec := range s.sections {
		// Section header
		label := fmt.Sprintf("[ %s ]", sec.Title)
		sb.WriteString(styles.SectionTitle.Render(label) + "\n")

		for _, item := range sec.Items {
			prefix := "  "
			var line string
			if flatIdx == s.cursor {
				line = styles.SelectedItem.Render(fmt.Sprintf("▶ %s", item.Label))
			} else {
				line = styles.NormalItem.Render(fmt.Sprintf("%s%s", prefix, item.Label))
			}
			// Truncate if too wide
			if len(line) > inner {
				line = line[:inner]
			}
			sb.WriteString(line + "\n")
			flatIdx++
		}
		sb.WriteString("\n")
	}

	content := sb.String()
	// Trim trailing newlines to avoid layout drift
	content = strings.TrimRight(content, "\n")

	return borderStyle.
		Width(width - 2).
		Height(height - 2).
		Render(content)
}
