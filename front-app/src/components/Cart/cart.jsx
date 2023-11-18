import { useState } from "react";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import Button from "@mui/material/Button";
import ListCart from "../Listcart/listcart";

import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Typography from "@mui/material/Typography";

import { useCarrinho } from "../../context/useCarrinho";
import { useFormat } from "../../utils/useFormat";
import { NavLink } from "react-router-dom";

import "./cart.css";

export default function Cart() {
  const [value, setValue] = useState(0);

  const [openModalCarrinho, setOpenModalCarrinho] = useState(false);

  const { cart, calculateSubtotal, clearCart } = useCarrinho();

  const openListItems = () => {
    const addproducts = document.getElementById("displayItems");
    addproducts.classList.toggle("displayItemson");
  };
  const handleOpenModalCarrinho = () => {
    setOpenModalCarrinho(true);
  };
  const handleCloseModalCarrinho = () => {
    setOpenModalCarrinho(false);
  };

  return (
    <>
      <Box id="displayItems">
        <Box
          sx={{
            backgroundColor: "#f76d26",
            overflow: "hidden",
            width: "100%",
            height: "4rem",
            minHeight: "3rem",
            display: "flex",
            alignContent: "center",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            zIndex: "3",
          }}
        >
          <Button
            className="click box-shadow"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#fb6c1a",
              border: "1px #fae9de solid",
              borderRadius: "8px",
              color: "#fae9de",
              height: "75%",
            }}
            onClick={clearCart}
          >
            Limpar carrinho
          </Button>
        </Box>
        <ListCart />
        <Box
          sx={{
            display: "flex",
            width: "95%",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            bottom: "8.5rem",
            position: "absolute",
          }}
        >
          <Box
            sx={{
              color: "#f76d26",
              height: "4.9rem",
              width: "100%",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderRadius: "13px",
              textAlign: "center",
            }}
          >
            <Typography
              className="sumPriceCart "
              variant="h6"
              sx={{
                backgroundColor: "#fae9de",
                color: "#f76d26",
                height: "3.9rem",
                width: "8rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "13px",
                textAlign: "center",
                boxShadow: " 5px 4px 5px 2px rgba(0, 0, 0, 0.2)",
              }}
            >
              Subtotal: {useFormat(calculateSubtotal(cart))}
            </Typography>
            <Button
              sx={{ width: "50%" }}
              className="btnreturnpurchase click"
              variant="outlined"
              onClick={openListItems}
            >
              continuar Comprando
            </Button>
          </Box>
        </Box>
        {cart.length === 0 ? (
          <Box></Box>
        ) : (
          <NavLink
            to="/pedido"
            style={{
              display: "flex",
              width: " 95%",
              bottom: "8.5rem",
              position: "absolute",
              textDecoration: "none",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Button
              className="btncheckout click"
              sx={{
                bottom: "-4rem",
                position: "absolute",
                color: "#f7e9e1",
                backgroundColor: "red",
                borderRadius: "13px",
                border: "1px solid #fae9de",
                boxShadow:
                  "5px 4px 5px 2px rgba(0, 0, 0, 0.2), 5px 4px 5px 2px rgba(0, 0, 0, 0.14), 5px 4px 5px 2px rgba(0, 0, 0, 0.12)",
              }}
            >
              Ir para Pagamento
            </Button>
          </NavLink>
        )}
      </Box>

      <Box className="footer">
        <BottomNavigation
          className="contentFooter"
          showLabels
          value={value}
          onChange={(event, newValue) => {
            setValue(newValue);
          }}
        >
          <BottomNavigationAction
            id="carticon "
            className="iconsfooter"
            label="Carrinho"
            icon={
              <Box
                sx={{
                  display: "flex",
                }}
              >
                {cart.length === 0 ? (
                  <>
                    <ShoppingCartOutlinedIcon
                      className="iconsfooter"
                      onClick={handleOpenModalCarrinho}
                    />
                    <Modal
                      aria-labelledby="transition-modal-title"
                      aria-describedby="transition-modal-description"
                      open={openModalCarrinho}
                      onClose={handleCloseModalCarrinho}
                      closeAfterTransition
                    >
                      <Fade in={openModalCarrinho}>
                        <Box
                          sx={{
                            overflow: "hidden",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#fae9de",
                            position: " absolute",
                            top: " 50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: " 90%",
                            maxWidth: "600px",
                            height: "5%",
                            minHeight: " 100px",
                            border: "6px solid #e5c7b3",
                            borderRadius: " 30px",
                            boxShadow: "5px 4px 5px 2px rgba(0, 0, 0, 0.2)",
                          }}
                        >
                          <Box id="modalContent">
                            <Box className="wrapper">
                              <Typography variant="h6">
                                Carrinho vazio
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Fade>
                    </Modal>
                  </>
                ) : (
                  <ShoppingCartOutlinedIcon
                      className="iconsfooter"
                      onClick={openListItems}
                    />
                )}
                {cart.length > 0 ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "red",
                      width: "17px",
                      height: "17px",
                      color: "#fff",
                      borderRadius: "50%",
                      margin: "-5px 0 0 -9px",
                    }}
                  >
                    {cart.length}
                  </Box>
                ) : (
                  ""
                )}
              </Box>
            }
          />
        </BottomNavigation>
      </Box>
    </>
  );
}
