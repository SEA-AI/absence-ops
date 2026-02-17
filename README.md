# Absence Ops

A tool to manage and track **labelled hours** in **absence.io**. Use it to assign labels in batch or bulk and see exactly how many hours are assigned to each activity.

## What it does
- **Batch Label Updates**: Select multiple tagged or untagged entries (using Shift+Click) and assign a label to all of them at once.
- **Track Labelled Hours**: A simple summary ribbon at the top shows total hours and the breakdown of hours per label.
- **Daily Summary**: Merges separate work blocks into a single day so you can easily see which days need label corrections.
- **Dark Mode**: Automatically follows your system theme.

## How to use it
1. **Get API Keys**: Find your "Client ID" and "Client Secret" in your absence.io profile under *Integrations -> OAuth*.
2. **Install**: Run `npm install` in your terminal.
3. **Run**: Run `npm run dev` and open the local link.
4. **Connect**: Enter your keys in the app. They are stored only in your browser (local storage).

## Deployment
Built for **GitHub Pages**. Pushing to `develop` will automatically build and deploy the site using the included GitHub Actions workflow.
