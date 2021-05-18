import { Pane, Heading, Text } from "evergreen-ui";
import { observer } from "mobx-react-lite"; // may not need it

export const Navbar = () => (
  <Pane
    width="100%"
    height="300px"
    display="flex"
    flexDirection="column"
    justifyContent="center"
    alignItems="center"
    paddingLeft="20px"
    paddingRight="20px"
    paddingTop="10px"
    paddingBottom="10px"
    background="linear-gradient(45deg, #f03030 0%, #309eff 80%)"
  >
    <Heading color="white" size={900}>
      BeaterList
    </Heading>
    <Text color="white">
      by{" "}
      <a
        href="https://zexuan.tk/projects/#beaterlist"
        rel="noopener noreferrer"
        target="blank"
        style={{ color: "white" }}
      >
        zexurge
      </a>
    </Text>
  </Pane>
);
export default observer(Navbar);
