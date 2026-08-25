# Basic Scaffolder — BC Quality Reviewer Skills & Prompts

A set of skills and prompts for GitHub Copilot agent mode that scaffold the workflow to run **BC Quality** against your AL code and turn the raw results into a readable HTML report.

📺 Video walkthrough: [BC Quality: Auditing Your Business Central Code](https://youtu.be/aQG67quBHHQ)
📝 Blog post: [BC Quality: Auditing Your Business Central Code](https://rcorella.github.io/LearningBusinessCentral/posts/agentic-development-bcquality.html)

## What this exercise covers

- Scaffolding a reviewer agent whose only source of truth is the BC Quality knowledge base (Microsoft, community, and custom rule layers).
- Locating the BC Quality repository (added as a git submodule) and building/checking its knowledge index before running a review.
- Running a review in single-file mode or batch mode (an entire `src` folder), with a warning when the file count is high.
- Generating one JSON output per reviewed file, including the review date, the source of each finding, and full detail.
- Converting those JSON files into a single, readable **HTML report**, grouped by file and by domain (UI, performance, style...), with each finding traced back to the exact BC Quality rule it came from.

## Folder structure

```
Basic Scaffolder/
├── .bcquality/                  # BC Quality knowledge base (Microsoft + community + custom layers)
├── .github/
│   ├── skills/                  # Reviewer skills used by the agent
│   ├── prompts/                 # Prompts driving the scaffolding workflow
│   └── agents/                  # bcquality-reviewer.agent.md
└── tools/
    └── build-html-report.js     # Generates the HTML report from the JSON review output
```

*(Update the paths above to match your actual project layout.)*

## How to try it

1. Open the `Basic Scaffolder` folder in VS Code with GitHub Copilot agent mode enabled.
2. Make sure the BC Quality knowledge index is built (regenerate it if you've added new knowledge files).
3. Run the reviewer agent against a single AL file, or a whole `src` folder in batch mode.
4. Review the generated JSON output per file.
5. Run the HTML report generator to turn all the JSON files into one readable report you can open in a browser.

## Requirements

- VS Code with GitHub Copilot agent mode.
- Node.js (for the HTML report generator).
- The [BC Quality](https://github.com/microsoft) knowledge base as a git submodule.

---

Part of the [CodeLearningBusinessCentral](../) exercise repository.
