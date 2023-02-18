import { Spin, Table, Typography } from "antd";
import React from "react";
import { Game } from "../types/game";
import { useBlockNumber } from "wagmi";
import { useQuery } from "react-query";
import { gql } from "@apollo/client";
import { graphQLClient } from "../constants/graph";
import { truncateAddress } from "../utils";

const GET_GAMES_GQL = `
  query getGames  {
    games (first:100, orderBy: blockNumber, orderDirection: desc) {
      id
      win
      loss
      blockTimestamp
      blockNumber
    }
  }
`;

export const RecentGames: React.FC = () => {
  const { data: blockNumber } = useBlockNumber({
    watch: true,
  });
  const { data, isLoading } = useQuery<{
    data: {
      games: Game[];
    };
  }>({
    onError: (error) => console.log(error),
    queryKey: ["games", blockNumber],
    queryFn: () => {
      return graphQLClient.query({
        query: gql`
          ${GET_GAMES_GQL}
        `,
      });
    },
  });

  const makeRows = (data?: Game[]) => {
    if (!data || data.length === 0) return [];
    return data.map((game) => {
      const date = new Date(parseInt(game.blockTimestamp) * 1000);
      return {
        key: game.id,
        win: truncateAddress(game.win),
        loss: truncateAddress(game.loss),
        // @ts-ignore
        timestamp: date.toLocaleString(),
        number: game.blockNumber,
      };
    });
  };

  const columns = [
    {
      title: "Timestamp",
      dataIndex: "timestamp",
      key: "timestamp",
      width: 20,
    },
    {
      title: "Block Number",
      dataIndex: "number",
      key: "number",
      width: 10,
    },

    {
      title: "Win",
      dataIndex: "win",
      key: "win",
      width: 10,
    },
    {
      title: "Loss",
      dataIndex: "loss",
      key: "loss",
      width: 10,
    },
  ];

  const rows = makeRows(data?.data.games);

  return (
    <div>
      <Typography.Title level={3}>
        Recent Games
        {isLoading && <Spin />}
      </Typography.Title>

      <Table dataSource={rows} columns={columns} />
    </div>
  );
};

export default RecentGames;
