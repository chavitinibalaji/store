# Copilot Instructions for AWS Store Project

## Project Overview
This is a simple Java project using VS Code's built-in Java support. It's structured as a basic command-line application with AWS-related context (workspace path suggests AWS integration potential).

**Key Files:**
- [src/App.java](../src/App.java) - Entry point with main method

## Project Structure & Build Configuration

The project follows VS Code's default Java layout:
- **Source code**: `src/` folder (configured in `.vscode/settings.json`)
- **Output**: Compiled classes go to `bin/` (not tracked in source)
- **Dependencies**: JAR files in `lib/` folder referenced via `lib/**/*.jar` glob pattern

Build configuration in `.vscode/settings.json`:
```json
"java.project.sourcePaths": ["src"],
"java.project.outputPath": "bin",
"java.project.referencedLibraries": ["lib/**/*.jar"]
```

## Development Workflow

**Compilation & Running:**
- VS Code Java Extension handles automatic compilation
- Use the VS Code Testing/Run UI to execute `App.java`
- No explicit build commands needed (Maven/Gradle not configured)

**Adding Dependencies:**
1. Place JAR files in the `lib/` folder
2. They are automatically added to the classpath via the glob pattern in settings
3. Use JAVA PROJECTS view in VS Code to manage dependencies

## Code Patterns & Conventions

- **Entry Point**: Single `App` class with `public static void main(String[] args)` method
- **Exception Handling**: Current implementation throws exceptions (`throws Exception`)
- **Simplicity First**: Minimize dependencies; add JAR files only when necessary

## When Making Changes

When adding new features or expanding the application:
1. Create new Java classes in `src/` folder
2. Ensure classes follow Java naming conventions (PascalCase for classes)
3. If external libraries are needed, add JARs to `lib/` and they'll be available automatically
4. Test by running through VS Code's Run/Debug UI

## AI Agent Notes

- This is a minimal Java project—assume simple requirements unless otherwise specified
- No complex build system to navigate; focus on Java code quality
- If AWS integration is mentioned in a future requirement, clarify whether AWS SDK JARs should be added to `lib/`
