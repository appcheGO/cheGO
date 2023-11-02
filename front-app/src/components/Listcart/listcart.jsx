/* eslint-disable react-hooks/rules-of-hooks */

import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { useCarrinho } from "../../context/useCarrinho";
import { useFormat } from "../../utils/useFormat";
import DeleteIcon from "@mui/icons-material/Delete";
import "../Listcart/listcart.css";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useEffect } from "react";

export default function ListCart() {
  const {
    cart,
    deleteFromCart,
    isSameCartItem,
    setCart,
    saveCartToSessionStorage,
  } = useCarrinho();
  useEffect(() => {
    let itensSelecionados =
      JSON.parse(sessionStorage.getItem("itensSelecionados")) || [];

    if (cart.length > 0) {
      const primeiroItemNoCarrinho = cart[0];
      const novoValorTotalDoProduto =
        (primeiroItemNoCarrinho.valor +
          primeiroItemNoCarrinho.valorTotalAdicionais +
          primeiroItemNoCarrinho.valorSelecionado) *
        primeiroItemNoCarrinho.quantidade;

      const itemAtualizado = itensSelecionados.find(
        (item) => item.id === primeiroItemNoCarrinho.id
      );

      if (itemAtualizado) {
        itemAtualizado.valorTotalDoProduto = novoValorTotalDoProduto;

        sessionStorage.setItem(
          "itensSelecionados",
          JSON.stringify(itensSelecionados)
        );
      }
    }
  }, [cart]);

  const handleDelete = (item) => {
    deleteFromCart(item);
  };

  const handleIncrement = (item) => {
    const date = new Date();
    const newQuantidade = item.quantidade + 1;

    const newValorTotalDoProduto =
      (item.valor + item.valorTotalAdicionais) * newQuantidade;

    const updatedItem = {
      ...item,
      key: date.getMilliseconds(),
      quantidade: newQuantidade,
      valorTotalDoProduto: newValorTotalDoProduto,
    };

    const updatedCart = cart.map((cartItem) => {
      if (isSameCartItem(cartItem, updatedItem)) {
        return updatedItem;
      }
      return cartItem;
    });

    setCart(updatedCart);
    saveCartToSessionStorage(updatedCart);
  };

  const handleDecrement = (item) => {
    if (item.quantidade > 1) {
      const date = new Date();
      const newQuantidade = item.quantidade - 1;

      const newValorTotalDoProduto =
        (item.valor + item.valorTotalAdicionais) * newQuantidade;

      const updatedItem = {
        ...item,
        key: date.getMilliseconds(),
        quantidade: newQuantidade,
        valorTotalDoProduto: newValorTotalDoProduto,
      };

      const updatedCart = cart.map((cartItem) => {
        if (isSameCartItem(cartItem, updatedItem)) {
          return updatedItem;
        }
        return cartItem;
      });

      setCart(updatedCart);
      saveCartToSessionStorage(updatedCart);
    }
  };

  return (
    <>
      <Box
        sx={{
          position: "relative",
          top: "-13rem",
          marginTop: "-1.2rem",
          width: "98%",
          overflow: "auto",
          paddingTop: "14rem",
        }}
      >
        <Box>
          <Box
            sx={{
              height: "auto",
              paddingLeft: "0.5rem",
              paddingRight: "0.5rem",
              paddingBottom: "2rem",
            }}
          >
            {cart.map((item) => (
              <Card
                id="itemCard"
                key={item.id}
                sx={{
                  position: "relative",
                  display: "flex",
                  backgroundColor: "#fae9de",
                  height: "auto",
                  width: "100%",
                  justifyContent: "flex-start",
                  flexDirection: "row",
                  alignItems: "center",
                  borderRadius: "29px !important",
                  margin: "0.4rem 0 10px 0",
                  border: "3px #f46c26 solid",
                  boxShadow:
                    "2px 8px 7px 5px #0003, 2px 2px 3px -1px #00000024, 2px 6px 4px #0000001f !important",
                }}
              >
                <CardContent
                  sx={{
                    position: "relative",
                    display: "flex",
                    backgroundColor: "#fae9de",
                    height: "100%",
                    width: "100%",
                    alignItems: "center",
                    flexDirection: "row",
                    padding: "0 !important",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-around",
                      alignItems: "start",
                      backgroundColor: "#fae9de",
                      height: "100%",
                      width: "100%",
                      paddingLeft: "1rem",
                      paddingRight: "0.5rem;",
                    }}
                  >
                    <Typography
                      sx={{
                        width: "100%",
                      }}
                      variant="h6"
                    >
                      {item.sabor}
                    </Typography>
                    <Typography
                      sx={{
                        width: "100%",
                        borderBottom: "2px dotted",
                      }}
                    >
                      {item.ingredientes}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          width: "100%",
                        }}
                      >
                        {item.refrigeranteDoCombo === "" || undefined ? (
                          <Box></Box>
                        ) : (
                          <Typography
                            sx={{
                              width: "100%",
                              display: "flex",
                              flexDirection: "row",
                            }}
                            variant="body2"
                            gutterBottom
                          >
                            <em>
                              <b>Opcional do combo:</b>
                            </em>
                            <p style={{ paddingLeft: "5px" }}>
                              {item.refrigeranteDoCombo}
                            </p>
                          </Typography>
                        )}
                        {item.opicionais === "" || undefined ? (
                          <Box></Box>
                        ) : (
                          <>
                            <Typography
                              sx={{
                                width: "100%",
                                display: "flex",
                                flexDirection: "row",
                              }}
                              variant="body2"
                              gutterBottom
                            >
                              <em>
                                <b>Opcional:</b>
                              </em>
                              <p style={{ paddingLeft: "5px" }}>
                                {item.opicionais}
                              </p>
                            </Typography>
                            <Typography
                              sx={{
                                width: "100%",
                                display: "flex",
                                flexDirection: "row",
                              }}
                              variant="body2"
                              gutterBottom
                            >
                              <em>
                                <b>Valor do opcional: </b>
                              </em>
                            </Typography>
                          </>
                        )}

                        {item.adicionais && item.adicionais.length > 0 && (
                          <Box>
                            {item.adicionais === "" || undefined ? (
                              <Box></Box>
                            ) : (
                              <Typography
                                sx={{
                                  width: "100%",
                                }}
                                variant="body2"
                                gutterBottom
                              >
                                <em>
                                  <b>Adicionais:</b>
                                </em>
                              </Typography>
                            )}

                            {item.adicionais.map((item) => (
                              <Typography
                                sx={{
                                  width: "100%",
                                  display: "flex",
                                  flexDirection: "row",
                                }}
                                variant="body2"
                                gutterBottom
                                key={item.id}
                              >
                                ({item.qtde}x) {item.name} {""}
                                {useFormat(item.valor)}
                              </Typography>
                            ))}
                          </Box>
                        )}
                        {item.valorTotalAdicionais === 0 || undefined ? (
                          <Box></Box>
                        ) : (
                          <Typography
                            sx={{
                              width: "100%",
                              display: "flex",
                              flexDirection: "row",
                            }}
                            variant="body2"
                            gutterBottom
                          >
                            <em>
                              <b>Valor Adicionais:</b>
                            </em>
                            <p style={{ paddingLeft: "5px" }}>
                              {useFormat(item.valorTotalAdicionais)}
                            </p>
                          </Typography>
                        )}
                        {item.observacao === "" || undefined ? (
                          <Box></Box>
                        ) : (
                          <Typography
                            sx={{
                              width: "100%",
                              display: "flex",
                              flexDirection: "row",
                            }}
                            variant="body2"
                            gutterBottom
                          >
                            <em>
                              <b>Observação:</b>
                            </em>
                            <p style={{ paddingLeft: "5px" }}>
                              {item.observacao}
                            </p>
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",

                        borderTop: "2px dotted",
                      }}
                    >
                      <Typography variant="h6">
                        {useFormat(
                          (item.valor +
                            item.valorTotalAdicionais +
                            item.valorSelecionado) *
                            item.quantidade
                        )}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          marginLeft: "1rem",
                        }}
                      >
                        <DeleteIcon
                          className="click"
                          onClick={() => handleDelete(item)}
                          style={{ cursor: "pointer" }}
                        />
                        <Button
                          sx={{ color: "#201e1d" }}
                          onClick={() => handleDecrement(item)}
                          disabled={item.quantidade === 1}
                        >
                          <RemoveIcon />
                        </Button>
                        <span style={{ maxWidth: "10px" }}>
                          {item.quantidade}
                        </span>
                        <Button
                          sx={{ color: "#201e1d" }}
                          onClick={() => handleIncrement(item)}
                        >
                          <AddIcon />
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      </Box>
    </>
  );
}
