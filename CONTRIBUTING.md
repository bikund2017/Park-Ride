# Contributing to Park & Ride+ Delhi NCR

Thank you for your interest in contributing to Park & Ride+ Delhi NCR! We welcome contributions from the community.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of experience level, gender, gender identity and expression, sexual orientation, disability, personal appearance, body size, race, ethnicity, age, religion, or nationality.

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- Harassment, trolling, or discriminatory comments
- Personal or political attacks
- Publishing others' private information
- Any conduct that could reasonably be considered inappropriate

## Getting Started

### Prerequisites

Before contributing, ensure you have:
- Node.js 16+ and npm installed
- Git installed and configured
- A GitHub account
- Basic knowledge of React, Node.js, and Express.js
- Familiarity with Firebase and Google Maps API

### Setting Up Your Development Environment

1. **Fork the Repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/Park-Ride-.git
   cd Park-Ride-
   ```

2. **Add Upstream Remote**
   ```bash
   git remote add upstream https://github.com/bikund2017/Park-Ride-.git
   ```

3. **Install Dependencies**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd client
   npm install
   cd ..
   ```

4. **Set Up Environment Variables**
   - Copy `.env.example` to `.env` (if available)
   - Add your Firebase and Google Maps credentials
   - See README.md for detailed setup instructions

5. **Start Development Servers**
   ```bash
   # Terminal 1: Backend
   npm run dev
   
   # Terminal 2: Frontend
   cd client && npm run dev
   ```

## Development Process

### Finding Issues to Work On

1. Browse [open issues](https://github.com/bikund2017/Park-Ride-/issues)
2. Look for issues labeled `good first issue` or `help wanted`
3. Comment on the issue to express interest
4. Wait for maintainer approval before starting work

### Creating New Issues

Before creating an issue:
- Search existing issues to avoid duplicates
- Use the appropriate issue template
- Provide clear, detailed information
- Include screenshots or error messages when relevant

**Issue Types:**
- **Bug Report**: Something isn't working as expected
- **Feature Request**: Suggest a new feature or enhancement
- **Documentation**: Improvements to documentation
- **Question**: Ask for help or clarification

## Pull Request Process

### Before Submitting

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

2. **Make Your Changes**
   - Write clean, readable code
   - Follow existing code style
   - Add/update tests as needed
   - Update documentation

3. **Test Thoroughly**
   ```bash
   # Run tests
   npm test
   
   # Check for linting errors
   npm run lint
   
   # Test the application manually
   npm run dev:full
   ```

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: Add your feature description"
   ```

5. **Sync with Upstream**
   ```bash
   git fetch upstream
   git rebase upstream/master
   ```

6. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

### Submitting the Pull Request

1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Select your feature branch
4. Fill out the PR template completely
5. Link related issues (e.g., "Closes #123")
6. Request review from maintainers

### PR Title Format

Use conventional commit format:
- `feat: Add new feature`
- `fix: Fix bug in component`
- `docs: Update README`
- `style: Format code`
- `refactor: Restructure component`
- `test: Add tests for feature`
- `chore: Update dependencies`

### Review Process

- Maintainers will review your PR
- Address any requested changes
- Keep the discussion professional and constructive
- Be patient - reviews may take a few days
- Once approved, maintainers will merge your PR

## Coding Standards

### JavaScript/React

**General Principles:**
- Use ES6+ features (arrow functions, destructuring, etc.)
- Prefer functional components over class components
- Use React Hooks for state and side effects
- Keep components small and focused (< 200 lines)
- Extract reusable logic into custom hooks

**Naming Conventions:**
- Components: PascalCase (`MapView`, `ReportForm`)
- Files: PascalCase for components (`MapView.jsx`)
- Variables/Functions: camelCase (`handleClick`, `userData`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)
- CSS Classes: kebab-case (`map-container`)

**Code Organization:**
```javascript
// 1. Imports
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// 2. Component definition
function MyComponent({ prop1, prop2 }) {
  // 3. Hooks
  const [state, setState] = useState(null);
  
  useEffect(() => {
    // Side effects
  }, []);
  
  // 4. Event handlers
  const handleClick = () => {
    // Handler logic
  };
  
  // 5. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}

// 6. PropTypes
MyComponent.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number
};

// 7. Export
export default MyComponent;
```

**Best Practices:**
- Always use `const` or `let`, never `var`
- Add PropTypes for all component props
- Use optional chaining (`?.`) for nested properties
- Avoid inline functions in JSX when possible
- Use meaningful variable names
- Add comments for complex logic
- Handle errors gracefully
- Clean up side effects in `useEffect`

### CSS

- Use CSS Modules or CSS-in-JS when possible
- Follow BEM naming convention for global styles
- Mobile-first responsive design
- Use CSS variables for colors and spacing
- Avoid `!important` unless absolutely necessary

### File Structure

```
src/
├── components/           # Reusable components
│   ├── ComponentName/
│   │   ├── ComponentName.jsx
│   │   ├── ComponentName.css
│   │   └── index.js
├── contexts/            # React contexts
├── pages/               # Page components
├── hooks/               # Custom hooks
├── utils/               # Utility functions
├── services/            # API services
└── assets/              # Images, icons, etc.
```

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring without feature changes
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependencies

**Scope (optional):**
- `map`: Map-related changes
- `auth`: Authentication changes
- `api`: API changes
- `ui`: UI changes

**Subject:**
- Use imperative mood ("Add feature" not "Added feature")
- Don't capitalize first letter
- No period at the end
- Maximum 50 characters

**Examples:**
```bash
feat(map): add route planning feature
fix(auth): resolve login redirect issue
docs: update installation instructions
style: format code with prettier
refactor(api): simplify favorites endpoint
test(reports): add unit tests for report submission
chore: update dependencies to latest versions
```

## Testing

### Writing Tests

- Write tests for all new features
- Maintain or improve code coverage
- Test both success and error cases
- Use descriptive test names

**Example:**
```javascript
describe('ReportForm', () => {
  it('should submit report with valid data', () => {
    // Test implementation
  });
  
  it('should show error for invalid location', () => {
    // Test implementation
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Documentation

### Code Documentation

- Add JSDoc comments for functions
- Explain complex algorithms or business logic
- Document component props
- Update README when adding features

**Example:**
```javascript
/**
 * Calculates the distance between two coordinates
 * @param {number[]} coord1 - [latitude, longitude]
 * @param {number[]} coord2 - [latitude, longitude]
 * @returns {number} Distance in kilometers
 */
function calculateDistance(coord1, coord2) {
  // Implementation
}
```

### README Updates

When adding a feature:
- Update the Features section
- Add usage examples
- Update API documentation if applicable
- Add to the Roadmap if it's a major feature

## Questions?

If you have questions:
- Check the [README](README.md)
- Search [existing issues](https://github.com/bikund2017/Park-Ride-/issues)
- Open a new issue with the `question` label
- Reach out to maintainers

## Recognition

Contributors will be recognized in:
- GitHub contributors list
- Release notes
- Project documentation

Thank you for contributing to Park & Ride+ Delhi NCR! 🚗🚇
