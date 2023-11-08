import PropTypes from "prop-types";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Iconify from "../../components/iconify";
import AccountPopover from "./common/account-popover";

// ----------------------------------------------------------------------

export default function Header({ onOpenNav }) {
  const renderContent = (
    <>
      <IconButton onClick={onOpenNav} sx={{ mr: 1 }}>
        <Iconify icon="eva:menu-2-fill" />
      </IconButton>

      <Box sx={{ flexGrow: 1 }} />

      <Stack direction="row" alignItems="center" spacing={1}>
        <AccountPopover />
      </Stack>
    </>
  );

  return (
    <>
      <AppBar
        className="box-shadow"
        sx={{ width: "100%", backgroundColor: "#fff" }}
      >
        <Toolbar
          sx={{
            height: 1,
            px: { lg: 5 },
          }}
        >
          {renderContent}
        </Toolbar>
      </AppBar>
    </>
  );
}

Header.propTypes = {
  onOpenNav: PropTypes.func,
};
