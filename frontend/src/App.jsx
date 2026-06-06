import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './layout/AppShell.jsx';
import CreateLot from './pages/CreateLot.jsx';
import Dashboard from './pages/Dashboard.jsx';
import LotList from './pages/LotList.jsx';
import SerialDetails from './pages/SerialDetails.jsx';
import SerialList from './pages/SerialList.jsx';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="/lots" element={<LotList />} />
          <Route path="/create-lot" element={<CreateLot />} />
          <Route path="/serials" element={<SerialList />} />
          <Route path="/serials/:id" element={<SerialDetails />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
