import { Pane, Heading } from "evergreen-ui";
import { observer } from "mobx-react-lite"; // may not need it

export const Navbar = () => (
  <Pane
    width="100%"
    height="50px"
    display="flex"
    flexDirection="row"
    justifyContent="space-between"
    alignItems="center"
    paddingLeft="20px"
    paddingRight="20px"
    paddingTop="10px"
    paddingBottom="10px"
    backgroundColor="#012548"
  >
    <Heading color="white">BeaterList</Heading>
  </Pane>
);
export default observer(Navbar);
