import React, { useState } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Sprout } from "lucide-react";
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
  padding: 28px;
  box-shadow: ${shadows.card};
  max-width: 720px;
  margin: 0 auto;
  border: 1px solid ${colors.border};
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const Icon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: ${colors.green};
  color: white;
  display: grid;
  place-items: center;
  font-size: 22px;
  margin: 0 auto;
  box-shadow: ${shadows.soft};
`;

const Title = styled.h2`
  text-align: center;
  margin: 6px 0 0;
`;

const Subtitle = styled.p`
  text-align: center;
  margin: 0;
  color: ${colors.subtext};
`;

const Label = styled.label`
  font-weight: 700;
  margin-bottom: 6px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid ${colors.border};
  background: ${colors.surface};
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid ${colors.border};
  background: ${colors.surface};
  min-height: 110px;
  resize: vertical;
`;

const FrequencyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px;
`;

const FrequencyButton = styled.button`
  padding: 14px 12px;
  border-radius: 12px;
  border: 2px solid ${({ active }) => (active ? colors.green : colors.border)};
  background: ${({ active }) => (active ? colors.greenSoft : colors.surface)};
  font-weight: 700;
  color: ${colors.text};
  cursor: pointer;
  transition: border 0.2s ease, background 0.2s ease;
`;

const Primary = styled.button`
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  border: none;
  background: ${colors.green};
  color: white;
  font-weight: 800;
  font-size: 15px;
  cursor: pointer;
  box-shadow: ${shadows.soft};
`;

const NewHabit = () => {
  const [frequency, setFrequency] = useState("Daily");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        title,
        description,
        frequency: frequency.toLowerCase(),
        status,
      };
      const habit = await api.createHabit(payload);
      navigate(`/habit/${habit.id}`);
    } catch (err) {
      setError("Could not create habit");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <BackLink to="/">
        <ArrowLeft size={18} />
        Back
      </BackLink>
      <Card>
        <Icon>
          <Sprout size={24} color="white" />
        </Icon>
        <Title>Create New Habit</Title>
        <Subtitle>Define a habit you want to build and track your progress</Subtitle>

        <div>
          <Label>Habit Name</Label>
          <Input
            placeholder="e.g., Morning meditation"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <Label>Description (optional)</Label>
          <Textarea
            placeholder="Add details about this habit..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <Label>Frequency</Label>
          <FrequencyGrid>
            {["Daily", "Weekly", "Monthly"].map((option) => (
              <FrequencyButton
                type="button"
                key={option}
                active={frequency === option}
                onClick={() => setFrequency(option)}
              >
                {option}
              </FrequencyButton>
            ))}
          </FrequencyGrid>
        </div>

        {error && <Subtitle>{error}</Subtitle>}
        <Primary disabled={saving} onClick={handleSubmit}>
          {saving ? "Saving..." : "Create Habit"}
        </Primary>
      </Card>
    </div>
  );
};

export default NewHabit;
