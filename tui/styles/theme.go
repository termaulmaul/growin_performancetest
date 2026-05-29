package styles

import "github.com/charmbracelet/lipgloss"

const (
	ColorBg      = lipgloss.Color("#000000")
	ColorSurface = lipgloss.Color("#080808")
	ColorBorder  = lipgloss.Color("#1a1a2e")
	ColorAccent  = lipgloss.Color("#00e5ff")
	ColorText    = lipgloss.Color("#b0b8c1")
	ColorMuted   = lipgloss.Color("#333344")
	ColorPass    = lipgloss.Color("#00ff88")
	ColorFail    = lipgloss.Color("#ff2d55")
	ColorRunning = lipgloss.Color("#ff9f00")
)

var (
	PanelBorder = lipgloss.NewStyle().
			Border(lipgloss.NormalBorder()).
			BorderForeground(ColorBorder).
			Background(ColorBg)

	PanelBorderActive = lipgloss.NewStyle().
				Border(lipgloss.NormalBorder()).
				BorderForeground(ColorAccent).
				Background(ColorBg)

	TitleStyle = lipgloss.NewStyle().
			Foreground(ColorAccent).
			Bold(true).
			PaddingLeft(1).
			PaddingRight(1)

	SectionTitle = lipgloss.NewStyle().
			Foreground(ColorAccent).
			Bold(true)

	SelectedItem = lipgloss.NewStyle().
			Foreground(ColorAccent).
			Bold(true)

	NormalItem = lipgloss.NewStyle().
			Foreground(ColorText)

	MutedText = lipgloss.NewStyle().
			Foreground(ColorMuted)

	BadgeIdle = lipgloss.NewStyle().
			Foreground(ColorMuted).
			Bold(true)

	BadgeRunning = lipgloss.NewStyle().
			Foreground(ColorRunning).
			Bold(true)

	BadgePass = lipgloss.NewStyle().
			Foreground(ColorPass).
			Bold(true)

	BadgeFail = lipgloss.NewStyle().
			Foreground(ColorFail).
			Bold(true)

	FooterStyle = lipgloss.NewStyle().
			Foreground(ColorMuted).
			Background(ColorSurface).
			PaddingLeft(1).
			PaddingRight(1)

	ModalStyle = lipgloss.NewStyle().
			Border(lipgloss.NormalBorder()).
			BorderForeground(ColorAccent).
			Padding(1, 3).
			Background(ColorSurface)

	KeyHint = lipgloss.NewStyle().
		Foreground(ColorAccent).
		Bold(true)

	KeyDesc = lipgloss.NewStyle().
		Foreground(ColorMuted)

	BannerStyle = lipgloss.NewStyle().
			Foreground(ColorAccent).
			Background(ColorBg).
			Bold(true)

	BannerSub = lipgloss.NewStyle().
			Foreground(ColorMuted).
			Background(ColorBg)
)
