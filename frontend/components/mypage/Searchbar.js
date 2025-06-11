import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { SearchOutlined } from "@ant-design/icons";

const SearchWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: 1%;
  background-color: transparent;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 8px 12px;
  background-color: transparent;
  width: 100%;
  max-width: 400px;
`;

const Icon = styled(SearchOutlined)`
  font-size: 18px;
  color: #888;
  margin-right: 8px;
`;

const Input = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  background-color: transparent;
  color: #333;

  &::placeholder {
    color: #aaa;
  }
`;

/**
 * @param {Object[]} data - 필터링할 사용자 리스트
 * @param {Function} onResultChange - 필터링된 결과 전달 콜백
 * @param {string} placeholder - 입력창 placeholder
 */
const Searchbar = ({ data = [], onResultChange, placeholder = "검색" }) => {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      const filtered = query.trim()
        ? data.filter((user) =>
            user.nickname.toLowerCase().includes(query.toLowerCase())
          )
        : data;
      if (onResultChange) {
        onResultChange(filtered);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, data, onResultChange]);

  return (
    <SearchWrapper>
      <SearchBox>
        <Icon />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </SearchBox>
    </SearchWrapper>
  );
};

export default Searchbar;
