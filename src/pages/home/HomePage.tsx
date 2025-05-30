import { useState } from "react";
import { GithubTabs } from "../../components/github/GithubTabs";
import { Layout } from "../../components/layout/Layout";

const HomePage = () => {
  const [activeTab, setActiveTab] = useState("search");

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      <GithubTabs activeTab={activeTab} />
    </Layout>
  );
};

export default HomePage;
