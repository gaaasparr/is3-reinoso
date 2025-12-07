import React from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import styled, { createGlobalStyle } from "styled-components";
import Dashboard from "./pages/Dashboard";
import NewHabit from "./pages/NewHabit";
import HabitDetail from "./pages/HabitDetail";
import { colors, shadows } from "./theme";
import { Home, Plus, Target } from "lucide-react";

const GlobalStyle = createGlobalStyle`
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: "Inter", "Segoe UI", system-ui, -apple-system, sans-serif;
    background: ${colors.background};
    color: ${colors.text};
  }
  a { text-decoration: none; color: inherit; }
  input, textarea, button { font-family: inherit; }
`;

const AppShell = styled.div`
  min-height: 100vh;
  background: ${colors.background};
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 38px;
  background: ${colors.surface};
  border-bottom: 1px solid ${colors.border};
  position: sticky;
  top: 0;
  z-index: 10;
`;

const Brand = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
  font-size: 18px;
`;

const Logo = styled.span`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: ${colors.green};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: ${shadows.soft};
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const NavLink = styled(Link)`
  padding: 10px 16px;
  border-radius: 14px;
  border: 1px solid ${colors.border};
  background: ${({ active }) => (active ? colors.greenSoft : colors.surface)};
  color: ${colors.text};
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: ${({ active }) => (active ? shadows.soft : "none")};
`;

const PrimaryButton = styled(Link)`
  padding: 10px 16px;
  border-radius: 14px;
  background: ${colors.green};
  color: white;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: ${shadows.soft};
`;

const Content = styled.main`
  max-width: 1180px;
  margin: 0 auto;
  padding: 28px 22px 64px;
`;

const Navigation = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <Header>
      <Brand to="/">
        <Logo>
          <Target size={20} strokeWidth={2.5} color="white" />
        </Logo>
        Habit Tracker
      </Brand>
      <Nav>
        <NavLink to="/" active={path === "/"}>
          <Home size={18} />
          Dashboard
        </NavLink>
        <PrimaryButton to="/new">
          <Plus size={18} />
          New Habit
        </PrimaryButton>
      </Nav>
    </Header>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <GlobalStyle />
      <AppShell>
        <Navigation />
        <Content>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/new" element={<NewHabit />} />
            <Route path="/habit/:id" element={<HabitDetail />} />
          </Routes>
        </Content>
      </AppShell>
    </BrowserRouter>
  );
};

export default App;
