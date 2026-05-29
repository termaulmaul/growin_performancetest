package panels

import (
	"fmt"
	"strings"

	"mostngk6x/tui/styles"

	"github.com/charmbracelet/bubbles/viewport"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

// Preview renders scrollable log output.
type Preview struct {
	vp     viewport.Model
	status string // IDLE | RUNNING | PASS | FAIL
	lines  []string
	follow bool // auto-scroll to bottom when new lines arrive
}

// NewPreview creates a Preview panel.
func NewPreview(width, height int) Preview {
	vp := viewport.New(width-4, height-5)
	vp.Style = lipgloss.NewStyle().
		Foreground(styles.ColorText)
	return Preview{
		vp:     vp,
		status: "IDLE",
		follow: true,
	}
}

// SetStatus sets the badge status (IDLE/RUNNING/PASS/FAIL).
func (p *Preview) SetStatus(s string) {
	p.status = s
}

// AppendLine adds a line to the log buffer and marks follow=true.
func (p *Preview) AppendLine(s string) {
	p.lines = append(p.lines, s)
	p.vp.SetContent(strings.Join(p.lines, "\n"))
	p.follow = true
}

// ClearLines empties the log buffer.
func (p *Preview) ClearLines() {
	p.lines = nil
	p.vp.SetContent("")
	p.follow = true
}

// Resize adjusts the viewport dimensions.
func (p *Preview) Resize(width, height int) {
	p.vp.Width = width - 4
	p.vp.Height = height - 5
	if p.vp.Width < 1 {
		p.vp.Width = 1
	}
	if p.vp.Height < 1 {
		p.vp.Height = 1
	}
	// Re-set content to ensure scroll position is recalculated
	p.vp.SetContent(strings.Join(p.lines, "\n"))
}

// Update handles keyboard input for the viewport.
// Disables follow when user scrolls up; re-enables when they reach bottom.
func (p *Preview) Update(msg tea.Msg) {
	prevOffset := p.vp.YOffset
	var cmd tea.Cmd
	p.vp, cmd = p.vp.Update(msg)
	_ = cmd
	if p.vp.YOffset < prevOffset {
		p.follow = false
	}
	if p.vp.AtBottom() {
		p.follow = true
	}
}

// badge renders a coloured status badge.
func (p Preview) badge() string {
	switch p.status {
	case "RUNNING":
		return styles.BadgeRunning.Render("● RUNNING")
	case "PASS":
		return styles.BadgePass.Render("✓ PASS")
	case "FAIL":
		return styles.BadgeFail.Render("✗ FAIL")
	default:
		return styles.BadgeIdle.Render("○ IDLE")
	}
}

// View renders the preview panel.
// Pointer receiver ensures GotoBottom() takes effect before vp.View().
func (p *Preview) View(width, height int, active bool) string {
	if p.follow {
		p.vp.GotoBottom()
	}
	borderStyle := styles.PanelBorder
	if active {
		borderStyle = styles.PanelBorderActive
	}

	title := styles.TitleStyle.Render(" LOG ") + "  " + p.badge()

	lineCount := styles.MutedText.Render(fmt.Sprintf("  %d lines", len(p.lines)))
	scrollPct := styles.MutedText.Render(fmt.Sprintf("  %3.0f%%", p.vp.ScrollPercent()*100))
	footer := lineCount + scrollPct

	content := title + "\n" + p.vp.View() + "\n" + footer

	return borderStyle.
		Width(width - 2).
		Height(height - 2).
		Render(content)
}
