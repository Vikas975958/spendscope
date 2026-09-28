"use client";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { changePrimaryColor, changeTheme } from "@/redux/slices/themeSlice";
import { colors } from "@/utils/theme";
import styled, { useTheme } from "styled-components";
import { Switch } from "antd";

const ThemeChange = ({ handleClose }) => {
  const dispatch = useDispatch();

  const handleThemeOpen = (color) => {
    dispatch(changePrimaryColor(color));
  };

  const theme = useTheme();
  const reduxTheme = useSelector((state) => state?.themeSlice || state?.theme);
  const isDark = theme?.mode === "dark" || reduxTheme?.mode === "dark";

  const handleThemeChange = (checked) => {
    dispatch(changeTheme(checked ? "dark" : "light"));
  };

  return (
    <>
      <Backdrop onClick={handleClose} />
      <ModalWapper>
        <Header>
          <Title>Themes</Title>
          <Switch
            checkedChildren="Dark"
            unCheckedChildren="Light"
            checked={isDark}
            onChange={handleThemeChange}
          />
          <CloseButton onClick={handleClose} aria-label="Close theme selector">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </CloseButton>
        </Header>
        <ColorsContainer>
          {colors.map((color, idx) => (
            <ColorCircle
              key={idx}
              onClick={() => handleThemeOpen(color)}
              $color={color}
              title={color}
            />
          ))}
        </ColorsContainer>
      </ModalWapper>
    </>
  );
};

export default ThemeChange;

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  background-color: transparent;
`;

const ModalWapper = styled.div`
  position: fixed;
  top: 80px;
  right: 24px;
  z-index: 10000;
  background-color: ${({ theme }) => theme?.colors?.cardBg || "white"};
  border: 1px solid ${({ theme }) => theme?.colors?.border || "#e5e7eb"};
  display: flex;
  flex-direction: column;
  padding: 14px;
  border-radius: 10px;
  box-shadow: 0 14px 35px rgba(0, 0, 0, 0.18);
  width: 230px;
  max-width: calc(100vw - 32px);

  @media (max-width: 640px) {
    top: 75px;
    right: 16px;
    width: 210px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  width: 100%;
`;

const Title = styled.span`
  font-size: 14.5px;
  font-weight: 700;
  color: ${({ theme }) => theme?.colors?.text || "#1f2937"};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme?.colors?.border || "#f3f4f6"};
    color: ${({ theme }) => theme?.colors?.text || "#4b5563"};
  }
`;

const ColorsContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 10px;
`;

const ColorCircle = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: ${(props) => props.$color};
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0.15);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: scale(1.2);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;
