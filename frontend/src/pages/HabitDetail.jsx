import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Check } from "lucide-react";
import { colors, shadows } from "../theme";
import { api } from "../services/api";

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: ${colors.subtext};
  margin-bottom: 18px;
`;

const Card = styled.div`
  background: ${colors.surface};
  border-radius: 20px;
  padding: 24px;
  box-shadow: ${shadows.card};
  border: 1px solid ${colors.border};
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const Pill = styled.span`
  align-self: flex-start;
  padding: 6px 10px;
  border-radius: 999px;
  background: ${colors.greenSoft};
  font-weight: 700;
  font-size: 12px;
`;

const Title = styled.h2`
  margin: 0;
`;

const Subtitle = styled.p`
  margin: 0;
  color: ${colors.subtext};
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
`;

const Stat = styled.div`
  padding: 14px;
  border-radius: 12px;
  border: 1px solid ${colors.border};
  background: ${({ tone }) => (tone === "yellow" ? colors.yellow : colors.surface)};
  min-height: 80px;
`;

const StatLabel = styled.div`
  font-size: 13px;
  color: ${colors.subtext};
`;

const StatValue = styled.div`
  font-size: 26px;
  font-weight: 800;
  margin-top: 6px;
`;

const Primary = styled.button`
  padding: 14px;
  border-radius: 12px;
  border: none;
  background: ${colors.green};
  color: white;
  font-weight: 800;
  font-size: 15px;
  cursor: pointer;
  box-shadow: ${shadows.soft};
  margin-top: 6px;
`;

const HistoryWrapper = styled.div`
  margin-top: 28px;
`;

const HistoryTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 12px;
`;

const HistoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(52px, 1fr));
  gap: 10px;
  background: ${colors.surface};
  padding: 16px;
  border-radius: 18px;
  border: 1px solid ${colors.border};
  box-shadow: ${shadows.soft};
`;

const DayCell = styled.div`
  aspect-ratio: 1 / 1;
  border-radius: 12px;
  background: ${({ done }) => (done ? colors.green : "transparent")};
  border: 1px solid ${colors.border};
  display: grid;
  place-items: center;
  color: ${({ done }) => (done ? "white" : colors.subtext)};
  font-weight: 700;
`;

const HabitDetail = () => {
  const { id } = useParams();
  const [habit, setHabit] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHabit = async () => {
      try {
        const data = await api.getHabit(id);
        setHabit(data);
        const filled = Array.from({ length: 21 }, (_, i) => i < (data.history_count || 0));
        setHistory(filled);
      } catch (err) {
        setError("Habit not found");
      } finally {
        setLoading(false);
      }
    };
    fetchHabit();
  }, [id]);

  const handleComplete = async () => {
    try {
      const updated = await api.completeHabit(id);
      setHabit(updated);
      const filled = Array.from({ length: 21 }, (_, i) => i < (updated.history_count || 0));
      setHistory(filled);
    } catch (err) {
      setError("Could not mark as completed");
    }
  };

  if (loading) return <Subtitle>Loading...</Subtitle>;
  if (error) return <Subtitle>{error}</Subtitle>;
  if (!habit) return null;

  return (
    <div>
      <BackLink to="/">
        <ArrowLeft size={18} />
        Back to Dashboard
      </BackLink>

      <Card>
        <Pill>{habit.frequency}</Pill>
        <Title>{habit.title}</Title>
        <Subtitle>{habit.description}</Subtitle>

        <StatGrid>
          <Stat>
            <StatLabel>Total Completions</StatLabel>
            <StatValue>{habit.history_count}</StatValue>
          </Stat>
          <Stat tone="yellow">
            <StatLabel>Streak Power</StatLabel>
            <StatValue>{habit.status}</StatValue>
          </Stat>
        </StatGrid>

        <Primary onClick={handleComplete}>Mark as Completed Today</Primary>
      </Card>

      <HistoryWrapper>
        <HistoryTitle>
          <CalendarDays size={18} />
          Completion History
        </HistoryTitle>
        <HistoryGrid>
          {history.map((done, index) => (
            <DayCell key={index} done={done}>
              {done ? <Check size={18} color={done ? "white" : colors.subtext} /> : null}
            </DayCell>
          ))}
        </HistoryGrid>
      </HistoryWrapper>
    </div>
  );
};

export default HabitDetail;
