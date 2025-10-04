# Star Wars API Explorer

A full-stack web application for exploring the Star Wars universe using the SWAPI (Star Wars API).

## Features

- 📱 **Responsive Web Interface** - Browse Star Wars data across categories
- 🎨 **Modern UI** - Clean, Star Wars-themed design with gold accents
- 🖼️ **Character Images** - Integration with Star Wars character image API
- 🔍 **Category Browsing** - Explore People, Films, Planets, Species, Starships, and Vehicles
- 📄 **Detailed Views** - Two-column layout with data and images
- 🔄 **Pagination** - Navigate through large datasets easily
- ✅ **Comprehensive Testing** - 92% backend coverage, full E2E testing
- 🚀 **Cloud Ready** - Terraform infrastructure for AWS EC2 deployment
- 🔄 **CI/CD Pipeline** - Automated testing with GitHub Actions

## Tech Stack

### Frontend
- Vanilla JavaScript (ES6+)
- HTML5 & CSS3
- Responsive design with CSS Grid & Flexbox

### Backend
- Node.js
- Express.js
- node-fetch for API integration

### Testing
- **Backend**: Jest (19 unit tests, 92% coverage)
- **Frontend**: Cucumber + Puppeteer (11 scenarios, 55 steps)

### Infrastructure
- Terraform for AWS EC2
- GitHub Actions for CI/CD
- Free Tier eligible deployment

## Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/star-wars-api.git
   cd star-wars-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### Running Tests

```bash
# Backend tests (Jest)
npm test

# Frontend tests (Cucumber)
npm run test:cucumber

# All tests
npm run test:all

# Watch mode for development
npm run test:watch
```

## Project Structure

```
star-wars-api/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI/CD pipeline
├── features/                   # Cucumber E2E tests
│   ├── step_definitions/       # Test step implementations
│   ├── support/                # Test setup and world
│   ├── detail-view.feature     # Detail view scenarios
│   ├── landing-page.feature    # Landing page scenarios
│   └── list-view.feature       # List view scenarios
├── public/                     # Frontend static files
│   ├── app.js                  # Frontend JavaScript
│   ├── index.html              # HTML structure
│   └── styles.css              # CSS styling
├── terraform/                  # AWS infrastructure as code
│   ├── main.tf                 # Main Terraform config
│   ├── variables.tf            # Input variables
│   ├── outputs.tf              # Output values
│   ├── user-data.sh            # EC2 initialization script
│   └── README.md               # Deployment guide
├── server.js                   # Express server
├── server.test.js              # Jest backend tests
├── package.json                # Node.js dependencies
├── cucumber.js                 # Cucumber configuration
└── README.md                   # This file
```

## API Endpoints

### Frontend Routes
- `GET /` - Landing page

### Backend API
- `GET /api/:category` - List items (people, films, planets, etc.)
  - Query params: `page` (default: 1)
- `GET /api/:category/:id` - Get specific item details

## Deployment

### AWS EC2 (Free Tier)

Full deployment instructions in [`terraform/README.md`](terraform/README.md)

**Quick Deploy:**
```bash
cd terraform
terraform init
terraform apply
```

**Cost**: Free Tier eligible (~$0/month for first 12 months, ~$8-10/month after)

### Environment Variables

```bash
PORT=3000          # Server port (default: 3000)
HOST=localhost     # Server host (default: localhost, use 0.0.0.0 for EC2)
NODE_ENV=production # Environment mode
```

## CI/CD Pipeline

GitHub Actions automatically:
- ✅ Runs backend unit tests (Jest)
- ✅ Runs frontend E2E tests (Cucumber)
- ✅ Checks code quality and security
- ✅ Validates build
- ✅ Generates test reports

**Setup**: See [`CI-CD-SETUP.md`](CI-CD-SETUP.md)

**Pipeline runs on:**
- Push to `main` or `develop`
- Pull requests to `main` or `develop`

## Testing Details

### Backend Tests (Jest)
- **Coverage**: 92% statements, 75% branches, 92% lines
- **Tests**: 19 unit tests
- **Focus**: API endpoints, error handling, edge cases

### Frontend Tests (Cucumber)
- **Scenarios**: 11 BDD scenarios
- **Steps**: 55 test steps
- **Coverage**: Landing page, list views, detail views, navigation

## Development

### Adding New Features

1. Create a new branch
   ```bash
   git checkout -b feature/your-feature
   ```

2. Make changes and add tests

3. Run tests locally
   ```bash
   npm run test:all
   ```

4. Commit with descriptive message
   ```bash
   git commit -m "Add: your feature description"
   ```

5. Push and create PR
   ```bash
   git push origin feature/your-feature
   ```

### Code Style

- Use ES6+ features
- Follow existing code structure
- Add tests for new features
- Keep functions small and focused
- Comment complex logic

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Known Issues

- Star Wars Visual Guide API is down, using alternative image sources
- Some images may not be available for all entities
- Cucumber tests require Chromium dependencies (auto-installed in CI)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Ensure all tests pass
6. Submit a pull request

## License

This project is created for educational purposes.

Star Wars and all related content are property of Lucasfilm Ltd. and Disney.

## Acknowledgments

- [SWAPI](https://swapi.dev/) - The Star Wars API
- [akabab/starwars-api](https://github.com/akabab/starwars-api) - Character images
- Built with [Claude Code](https://claude.com/claude-code)

## Support

For issues or questions:
- Open an issue on GitHub
- Check existing documentation in `/terraform` and `/features`

---

**Built with ❤️ using Claude Code**
