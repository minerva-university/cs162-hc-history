## Running Frontend Tests

### 1. Install dependencies

From the project root, install all dependencies for both root and frontend:

```bash
npm install
cd frontend
npm install
cd ..
 
 ```
 
### 2. Ensure correct dependency placement
All React and test-related dependencies (react, react-dom, @testing-library/*, jest, ts-jest, etc.) must be installed in the root directory.
Your frontend code and its dependencies should be in the frontend directory.

### 3. Run tests
From the root directory:
```npx jest```

### 4. Troubleshooting
Make sure there is only one version of React in the project (check with npm ls react in both root and frontend).
If you see errors about missing modules, install them in the root directory.
If you change dependencies, you may need to delete node_modules and package-lock.json in both root and frontend, then reinstall.
