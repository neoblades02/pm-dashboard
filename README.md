# PM Dashboard

A modern project management dashboard built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Authentication**: Secure login, registration, and password recovery
- **Project Management**: Create, view, edit, and delete projects
- **Task Management**: Kanban-style task board with drag-and-drop functionality
- **Dashboard**: Overview of projects and tasks with key metrics
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark Mode**: Toggle between light and dark themes

## Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui (built on Radix UI)
- **Authentication & Database**: Supabase (PostgreSQL)
- **State Management**: React Hooks
- **Form Handling**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account (free tier works fine)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/pm-dashboard.git
   cd pm-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

The application requires several tables in your Supabase database. You can find the SQL schema in `src/db/schema.sql`. Run these queries in the Supabase SQL editor to set up your database.

## Project Structure

```
pm-dashboard/
├── public/              # Static assets
├── src/
│   ├── app/             # Next.js App Router pages
│   │   ├── auth/        # Authentication pages
│   │   ├── dashboard/   # Dashboard and project pages
│   │   └── ...
│   ├── components/      # React components
│   │   ├── auth/        # Authentication components
│   │   ├── ui/          # UI components (shadcn)
│   │   └── ...
│   ├── lib/             # Utility functions
│   │   ├── supabase.ts  # Supabase client
│   │   └── utils.ts     # Helper functions
│   └── db/              # Database schema and types
└── ...
```

## Features in Detail

### Authentication

- **Login**: Email/password authentication
- **Registration**: Create a new account
- **Password Recovery**: Reset forgotten passwords

### Project Management

- **Projects Dashboard**: View all projects with status and progress
- **Project Details**: View and edit project information
- **Create Projects**: Add new projects with details like name, description, dates, etc.

### Task Management

- **Kanban Board**: Visual task management with columns for different statuses
- **Task Details**: View and edit task information
- **Create Tasks**: Add new tasks with details like title, description, priority, etc.
- **Task Assignment**: Assign tasks to team members

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Linting and Code Quality

This project uses ESLint to enforce code quality and consistency. We've set up custom configurations to handle common issues in TypeScript and React projects.

### Running Lint Checks

To check for linting issues:

```bash
npm run lint
```

### Auto-fixing Lint Issues

We've created a custom script to automatically fix common lint errors:

```bash
npm run lint-fix
```

This script handles:
- Removing unused imports
- Converting `any` types to more specific types in error handling
- Fixing unescaped apostrophes in JSX
- And more

### Common Lint Issues and Solutions

1. **Unused Imports/Variables**: 
   - Error: `'X' is defined but never used`
   - Fix: Remove unused imports or use the `lint-fix` script

2. **Explicit Any Types**:
   - Error: `Unexpected any. Specify a different type`
   - Fix: Replace `any` with more specific types like `unknown` (for errors) or proper interfaces

3. **Unescaped Entities**:
   - Error: `'` can be escaped with `&apos;`
   - Fix: Replace `'` with `&apos;` in JSX content

### ESLint Configuration

Our ESLint configuration (in `.eslintrc.json`) is set up to give warnings for common issues rather than errors, allowing development to continue while maintaining code quality standards.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)
