package utils

import (
	"os"
	"path/filepath"
	"sort"
	"strings"
)

// ScanSuites lists top-level directories inside scriptDir (Script/).
func ScanSuites(scriptDir string) ([]string, error) {
	entries, err := os.ReadDir(scriptDir)
	if err != nil {
		return nil, err
	}
	var suites []string
	for _, e := range entries {
		if e.IsDir() {
			suites = append(suites, e.Name())
		}
	}
	sort.Strings(suites)
	return suites, nil
}

// ScanScenarios finds BP*.js files directly inside suiteDir (any subdir).
// It searches Web/, Android/, iOS/ subdirs and returns the base name without extension.
func ScanScenarios(suiteDir string) ([]string, error) {
	var scenarios []string
	seen := make(map[string]bool)

	err := filepath.Walk(suiteDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return nil
		}
		if info.IsDir() {
			return nil
		}
		name := filepath.Base(path)
		if strings.HasPrefix(name, "BP") && strings.HasSuffix(name, ".js") &&
			!strings.HasPrefix(name, "enchange_") {
			base := strings.TrimSuffix(name, ".js")
			if !seen[base] {
				seen[base] = true
				scenarios = append(scenarios, base)
			}
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	sort.Strings(scenarios)
	return scenarios, nil
}
