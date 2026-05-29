package main

import (
	"fmt"
	"strings"

	"mostngk6x/tui/styles"

	"github.com/charmbracelet/lipgloss"
)

const bannerFull = `  ██████╗ ██████╗  ██████╗ ██╗    ██╗██╗███╗   ██╗    ██████╗ ████████╗
 ██╔════╝ ██╔══██╗██╔═══██╗██║    ██║██║████╗  ██║    ██╔══██╗╚══██╔══╝
 ██║  ███╗██████╔╝██║   ██║██║ █╗ ██║██║██╔██╗ ██║    ██████╔╝   ██║
 ██║   ██║██╔══██╗██║   ██║██║███╗██║██║██║╚██╗██║    ██╔═══╝    ██║
 ╚██████╔╝██║  ██║╚██████╔╝╚███╔███╔╝██║██║ ╚████║    ██║        ██║
  ╚═════╝ ╚═╝  ╚═╝ ╚═════╝  ╚══╝╚══╝ ╚═╝╚═╝  ╚═══╝    ╚═╝        ╚═╝  `

// View renders the full TUI layout.
func (m Model) View() string {
	if m.width < 80 || m.height < 24 {
		return "Terminal too small. Min 80x24.\n" +
			fmt.Sprintf("Current: %dx%d", m.width, m.height)
	}

	sideW := m.width * 22 / 100
	prevW := m.width * 34 / 100
	mainW := m.width - sideW - prevW - 6

	var header string
	bannerH := 0
	if m.height >= 34 {
		banner := styles.BannerStyle.Render(bannerFull)
		sub := styles.BannerSub.Render(strings.Repeat("─", m.width-2))
		header = lipgloss.JoinVertical(lipgloss.Left, banner, sub)
		bannerH = 8 // 6 lines art + 1 separator + 1 padding
	} else if m.height >= 27 {
		line := styles.BannerStyle.Render(" ▊ GROWIN PERFORMANCE TEST") +
			styles.BannerSub.Render("  k6 · Docker · SSH · Mock API")
		sep := styles.BannerSub.Render(strings.Repeat("─", m.width-2))
		header = lipgloss.JoinVertical(lipgloss.Left, line, sep)
		bannerH = 3
	}

	panelH := m.height - 3 - bannerH

	sidebar := m.sidebar.View(sideW, panelH, m.activePanel == 0)
	mainP := m.mainPanel.View(mainW, panelH, m.activePanel == 1)
	preview := m.preview.View(prevW, panelH, m.activePanel == 2)

	row := lipgloss.JoinHorizontal(lipgloss.Top, sidebar, mainP, preview)
	footer := m.renderFooter()

	var layout string
	if bannerH > 0 {
		layout = lipgloss.JoinVertical(lipgloss.Left, header, row, footer)
	} else {
		layout = lipgloss.JoinVertical(lipgloss.Left, row, footer)
	}

	if m.showQuitModal {
		layout = renderModal(layout, m.width, m.height)
	}

	return layout
}

func (m Model) renderFooter() string {
	status := styles.BadgeIdle.Render("○ IDLE")
	switch m.status {
	case "RUNNING":
		status = styles.BadgeRunning.Render("● RUNNING")
	case "PASS":
		status = styles.BadgePass.Render("✓ PASS")
	case "FAIL":
		status = styles.BadgeFail.Render("✗ FAIL")
	}

	shortcuts := []string{
		shortcut("Tab", "panel"),
		shortcut("↑↓", "nav"),
		shortcut("Enter", "exec"),
		shortcut("e", "env"),
		shortcut("s", "ssh"),
		shortcut("d", "docker"),
		shortcut("r", "retry"),
		shortcut("q", "quit"),
	}

	keys := strings.Join(shortcuts, "  ")

	lastAction := ""
	if m.lastAction != "" {
		lastAction = styles.MutedText.Render("  │  ") + styles.MutedText.Render(m.lastAction)
	}

	left := status + lastAction
	right := keys

	// Pad to fill width
	rawLeft := lipgloss.Width(left)
	rawRight := lipgloss.Width(right)
	pad := m.width - rawLeft - rawRight - 2
	if pad < 1 {
		pad = 1
	}

	footer := styles.FooterStyle.
		Width(m.width).
		Render(left + strings.Repeat(" ", pad) + right)

	return footer
}

func shortcut(key, desc string) string {
	return styles.KeyHint.Render(key) + styles.KeyDesc.Render("="+desc)
}

// renderModal overlays a quit confirmation dialog.
func renderModal(background string, width, height int) string {
	modal := styles.ModalStyle.Render(
		styles.TitleStyle.Render("Quit?") + "\n\n" +
			styles.NormalItem.Render("Press ") +
			styles.SelectedItem.Render("y") +
			styles.NormalItem.Render(" to quit, ") +
			styles.SelectedItem.Render("n") +
			styles.NormalItem.Render("/") +
			styles.SelectedItem.Render("Esc") +
			styles.NormalItem.Render(" to cancel."),
	)

	mw := lipgloss.Width(modal)
	mh := lipgloss.Height(modal)

	x := (width - mw) / 2
	y := (height - mh) / 2
	if x < 0 {
		x = 0
	}
	if y < 0 {
		y = 0
	}

	// Place modal over background using PlaceOverlay is not in lipgloss v0.12.
	// Instead, split background lines and insert modal lines.
	bgLines := strings.Split(background, "\n")
	modalLines := strings.Split(modal, "\n")

	for i, mLine := range modalLines {
		lineIdx := y + i
		if lineIdx >= len(bgLines) {
			break
		}
		bg := bgLines[lineIdx]
		// Pad bg line if shorter than x
		bgRunes := []rune(bg)
		for len(bgRunes) < x+mw {
			bgRunes = append(bgRunes, ' ')
		}
		// Replace characters at position x..x+mw with modal line
		mRunes := []rune(mLine)
		for j, r := range mRunes {
			pos := x + j
			if pos < len(bgRunes) {
				bgRunes[pos] = r
			}
		}
		bgLines[lineIdx] = string(bgRunes)
	}

	return strings.Join(bgLines, "\n")
}
