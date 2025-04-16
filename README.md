# Sustainity Dashboard

A modern, responsive dashboard for visualizing and analyzing CSV data with real-time filtering and sorting capabilities.

## Features

-  Interactive data visualization using Chart.js
-  Sortable and filterable data tables
-  Dark/Light mode support
-  Responsive design
-  Real-time data updates
-  Modern UI with Tailwind CSS

## Tech Stack

- **Framework**: Next.js with React
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Visualization**: Chart.js
- **CSV Parsing**: PapaParse
- **State Management**: React Hooks

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd sustainity-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
sustainity-dashboard/
├── components/
│   ├── ChartView.tsx    # Data visualization component
│   ├── DataTable.tsx    # Interactive data table component
│   └── FileUploader.tsx # CSV file upload component
├── pages/
│   └── index.tsx        # Main application page
├── public/              # Static assets
└── styles/             # Global styles
```

## Development Approach

### Component Architecture

The application is built with a component-based architecture, focusing on:

1. **Separation of Concerns**: Each component handles a specific functionality
   - `ChartView`: Data visualization
   - `DataTable`: Data display and interaction
   - `FileUploader`: File handling

2. **State Management**: Using React Hooks for local state management
   - `useState` for component state
   - `useEffect` for side effects
   - `useMemo` for performance optimization

3. **Data Flow**: Unidirectional data flow from parent to child components

### Challenges and Solutions

1. **Server-Side Rendering (SSR) Issues**
   - Challenge: PapaParse library is browser-only
   - Solution: Implemented dynamic imports and disabled SSR for data-processing components

2. **Performance Optimization**
   - Challenge: Large dataset rendering
   - Solution:
     - Implemented memoization with `useMemo`
     - Added pagination for large datasets
     - Optimized re-renders

3. **Type Safety**
   - Challenge: Handling unknown data types from CSV
   - Solution: Implemented comprehensive type checking and sanitization

4. **Responsive Design**
   - Challenge: Maintaining usability across devices
   - Solution: Used Tailwind CSS for responsive layouts and mobile-first design

## Best Practices Implemented

1. **Code Organization**
   - Modular component structure
   - Clear separation of concerns
   - Consistent file naming

2. **Type Safety**
   - TypeScript interfaces for props
   - Strict type checking
   - Proper error handling

3. **Performance**
   - Memoization of expensive computations
   - Lazy loading of components
   - Optimized re-renders

4. **User Experience**
   - Loading states
   - Error handling
   - Responsive design
   - Dark/Light mode support

## Future Improvements

1. **Features**
   - Export functionality for processed data
   - More chart types
   - Advanced filtering options
   - Data persistence

2. **Technical**
   - Unit testing
   - Performance monitoring
   - Accessibility improvements
   - Internationalization support

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.