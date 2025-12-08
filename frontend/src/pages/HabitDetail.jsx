import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Check, Trash2, X } from "lucide-react";
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

const Secondary = styled.button`
  padding: 14px;
  border-radius: 12px;
  border: 1px solid ${colors.border};
  background: ${colors.surface};
  color: ${colors.text};
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

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid ${colors.border};
  background: ${colors.surface};
  font-size: 15px;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid ${colors.border};
  background: ${colors.surface};
  font-size: 15px;
  min-height: 110px;
  resize: vertical;
`;

const ActionsRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const Danger = styled.button`
  padding: 14px;
  border-radius: 12px;
  border: 1px solid ${colors.border};
  background: #ffecec;
  color: #d14343;
  font-weight: 800;
  font-size: 15px;
  cursor: pointer;
  box-shadow: ${shadows.soft};
  margin-top: 6px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: grid;
  place-items: center;
  z-index: 10;
`;

const ModalCard = styled.div`
  background: ${colors.surface};
  border-radius: 16px;
  padding: 20px;
  width: min(420px, 90vw);
  box-shadow: ${shadows.card};
  border: 1px solid ${colors.border};
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const ModalTitle = styled.h3`
  margin: 0;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  flex-wrap: wrap;
`;

const HabitDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [habit, setHabit] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchHabit = async () => {
      try {
        const data = await api.getHabit(id);
        setHabit({ ...data, today_completions: data.today_completions || 0 });
        setFormTitle(data.title);
        setFormDesc(data.description || "");
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
    if (!habit) return;
    const optimistic = {
      ...habit,
      history_count: (habit.history_count || 0) + 1,
      today_completions: (habit.today_completions || 0) + 1,
    };
    setHabit(optimistic);
    setHistory(Array.from({ length: 21 }, (_, i) => i < optimistic.history_count));
    try {
      const updated = await api.completeHabit(id);
      setHabit(updated);
      setHistory(
        Array.from({ length: 21 }, (_, i) => i < (updated.history_count || 0))
      );
    } catch (err) {
      window.location.reload();
    }
  };

  const handleSave = async () => {
    if (!habit) return;
    setSaving(true);
    const previous = habit;
    const optimistic = { ...habit, title: formTitle, description: formDesc };
    setHabit(optimistic);
    try {
      const updated = await api.updateHabit(id, {
        title: formTitle,
        description: formDesc,
      });
      setHabit(updated);
      setEditing(false);
    } catch (err) {
      setHabit(previous);
      setFormTitle(previous.title);
      setFormDesc(previous.description || "");
      setError("Could not update habit");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!habit) return;
    setDeleting(true);
    try {
      await api.deleteHabit(habit.id);
      navigate("/");
    } catch (err) {
      window.location.reload();
    } finally {
      setDeleting(false);
      setShowDelete(false);
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
        {editing ? (
          <>
            <Input
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Habit title"
            />
            <TextArea
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="Description"
            />
          </>
        ) : (
          <>
            <Title>{habit.title}</Title>
            <Subtitle>{habit.description}</Subtitle>
          </>
        )}

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

        <ActionsRow>
          <Primary onClick={handleComplete}>Mark as Completed Today</Primary>
          {editing ? (
            <Secondary onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Secondary>
          ) : (
            <Secondary onClick={() => setEditing(true)}>Edit habit</Secondary>
          )}
          <Danger onClick={() => setShowDelete(true)}>
            <Trash2 size={16} />
            Delete
          </Danger>
        </ActionsRow>
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

      {showDelete && (
        <ModalOverlay>
          <ModalCard>
            <ModalHeader>
              <ModalTitle>Delete habit?</ModalTitle>
              <Secondary onClick={() => setShowDelete(false)}>
                <X size={16} />
              </Secondary>
            </ModalHeader>
            <Subtitle>
              This action will remove the habit from your dashboard. Do you want to
              continue?
            </Subtitle>
            <ModalActions>
              <Secondary onClick={() => setShowDelete(false)}>Cancel</Secondary>
              <Danger onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Confirm delete"}
              </Danger>
            </ModalActions>
          </ModalCard>
        </ModalOverlay>
      )}
    </div>
  );
};

export default HabitDetail;
