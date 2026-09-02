const fs = require('fs');
const env = fs.readFileSync('.env', 'utf-8');
const token = env.match(/GITHUB_TOKEN=(.*)/)[1].trim();

async function fetchGraphQL(query, variables) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'test'
    },
    body: JSON.stringify({ query, variables })
  });
  return res.json();
}

async function run() {
  const query = `
    query($login: String!) {
      user(login: $login) {
        repositories(first: 100, ownerAffiliations: OWNER, isFork: false, orderBy: {direction: DESC, field: STARGAZERS}) {
          nodes {
            name
            isPrivate
            languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
              edges {
                size
                node {
                  name
                }
              }
            }
          }
        }
      }
    }
  `;
  const data = await fetchGraphQL(query, { login: "taufiqrhmd" });
  if (data.errors) return;
  const repos = data.data.user.repositories.nodes;
  let hackSize = 0, pythonSize = 0, jsSize = 0;
  for (const repo of repos) {
    if (!repo.languages?.edges) continue;
    let repoHack = 0, repoPython = 0, repoJs = 0;
    for (const edge of repo.languages.edges) {
      if (edge.node.name === 'Hack') repoHack = edge.size;
      if (edge.node.name === 'Python') repoPython = edge.size;
      if (edge.node.name === 'JavaScript') repoJs = edge.size;
    }
    if (repoHack > 0) console.log('Repo with Hack:', repo.name, repoHack, 'Private:', repo.isPrivate);
    if (repoPython > 0) console.log('Repo with Python:', repo.name, repoPython, 'Private:', repo.isPrivate);
    if (repoJs > 0) console.log('Repo with JavaScript:', repo.name, repoJs, 'Private:', repo.isPrivate);
  }
}
run();
