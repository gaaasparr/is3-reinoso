import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { CheckCircle2, ChevronRight, CalendarCheck } from "lucide-react";
import { colors, shadows } from "../theme";
import { api } from "../services/api";

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin: 18px 0 28px;
`;

const StatCard = styled.div`
  background: ${({ tone }) =>
    tone === "mint" ? "#e9f6f0" : tone === "yellow" ? colors.yellow : colors.surface};
  color: ${colors.text};
  padding: 18px;
  border-radius: 18px;
  box-shadow: ${shadows.soft};
  border: 1px solid ${colors.border};
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: ${colors.subtext};
`;

const StatValue = styled.div`
  font-size: 30px;
  font-weight: 800;
`;

const StatNote = styled.div`
  font-size: 14px;
  color: ${colors.subtext};
`;

const SectionTitle = styled.h3`
  margin: 12px 0 14px;
`;

const HabitList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const HabitCard = styled(Link)`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  padding: 18px;
  border-radius: 18px;
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  box-shadow: ${shadows.card};
  color: inherit;
`;

const HabitHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 18px;
`;

const Pill = styled.span`
  padding: 6px 10px;
  border-radius: 999px;
  background: ${colors.greenSoft};
  color: ${colors.text};
  font-size: 12px;
  font-weight: 700;
`;

const HabitMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  color: ${colors.subtext};
  font-size: 14px;
  margin-top: 6px;
`;

const HabitChevron = styled.div`
  display: flex;
  align-items: center;
  font-size: 18px;
  color: ${colors.subtext};
`;

const Title = styled.h1`
  margin: 0;
`;

const Subtitle = styled.p`
  margin: 4px 0 0;
  color: ${colors.subtext};
`;

const Dashboard = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const data = await api.getHabits();
        setHabits(data);
      } catch (err) {
        setError("Could not load habits");
      } finally {
        setLoading(false);
      }
    };
    fetchHabits();
  }, []);

  const stats = useMemo(() => {
    const total = habits.length;
    const completions = habits.reduce((acc, h) => acc + (h.history_count || 0), 0);
    return { total, completions };
  }, [habits]);

  return (
    <div>
      <Title>Dashboard</Title>
      <Subtitle>Track your progress and build better habits</Subtitle>

      <StatsGrid>
        <StatCard>
          <StatLabel>Active Habits</StatLabel>
          <StatValue>{stats.total}</StatValue>
          <StatNote>Total habits tracked</StatNote>
        </StatCard>
        <StatCard tone="mint">
          <StatLabel>Completed Today</StatLabel>
          <StatValue>-</StatValue>
          <StatNote>Keep going!</StatNote>
        </StatCard>
        <StatCard tone="yellow">
          <StatLabel>Total Completions</StatLabel>
          <StatValue>{stats.completions}</StatValue>
          <StatNote>All-time progress</StatNote>
        </StatCard>
      </StatsGrid>

      <SectionTitle>Your Habits</SectionTitle>
      {error && <Subtitle>{error}</Subtitle>}
      {loading && <Subtitle>Loading...</Subtitle>}
      <HabitList>
        {habits.map((habit) => (
          <HabitCard to={`/habit/${habit.id}`} key={habit.id}>
            <div>
              <HabitHeader>
                <CheckCircle2 size={18} color={colors.green} />
                {habit.title}
                <Pill>{habit.frequency}</Pill>
              </HabitHeader>
              <Subtitle>{habit.description || "No description"}</Subtitle>
              <HabitMeta>
                <CalendarCheck size={16} />
                {habit.history_count} completions
              </HabitMeta>
            </div>
            <HabitChevron>
              <ChevronRight size={20} />
            </HabitChevron>
          </HabitCard>
        ))}
      </HabitList>
    </div>
  );
};

export default Dashboard;
