import { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
  addDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import {
  Container,
  Box,
  Typography,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import HomeIcon from "@mui/icons-material/Home";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import Header from "../../../layouts/dashboard/header";

export default function AppView() {
  const firebaseConfig = {
    apiKey: "AIzaSyCtUEJucj4FgNrJgwLhcpzZ7OJVCqjM8ls",
    authDomain: "testeapp-666bc.firebaseapp.com",
    projectId: "testeapp-666bc",
    storageBucket: "testeapp-666bc.appspot.com",
    messagingSenderId: "273940847816",
    appId: "1:273940847816:web:7d5c1f136cb8cac3c159fd",
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const [modalAberto, setModalAberto] = useState(false);

  const [pedidoEntregue, setPedidoEntregue] = useState([]);
  const [pedidoEmPreparo, setPedidoEmPreparo] = useState([]);
  const [pedidoFinalizado, setPedidoFinalizado] = useState([]);
  const [itensVisiveis, setItensVisiveis] = useState(false);
  const [enderecoVisivel, setEnderecoVisivel] = useState(false);
  const [listaDePedidos, setListaDePedidos] = useState([]);
  const enderecoPedidoRecebido = useState({
    rua: "",
    bairro: "",
    casaApto: "",
    cep: "",
    cidade: "",
    complemento: "",
    estado: "",
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps

  const fetchPedidos = async () => {
    const ordersQuery = query(
      collection(db, "PEDIDOS RECEBIDOS", "TELEFONE", "PEDIDOS")
    );

    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const pedidos = [];

      snapshot.forEach((doc) => {
        const orderData = doc.data();
        const orderNumber = doc.id;
        pedidos.push({
          numeroPedido: orderNumber,
          ...orderData,
        });
      });

      setListaDePedidos(pedidos);
    });

    return unsubscribe;
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  const prepararPedido = (pedido) => {
    setPedidoEmPreparo([...pedidoEmPreparo, pedido]);

    setListaDePedidos((pedidos) => pedidos.filter((p) => p !== pedido));
  };

  const pedidoPronto = () => {
    if (pedidoEmPreparo.length > 0) {
      const pedidoFinal = pedidoEmPreparo[0];
      setPedidoFinalizado([...pedidoFinalizado, pedidoFinal]);
      setPedidoEmPreparo(pedidoEmPreparo.slice(1));
    }
  };
  const moverParaPedidosFinalizados = async (pedidoFinalizado) => {
    try {
      const pedidosFinalizadosRef = collection(
        db,
        "PEDIDOS FINALIZADOS",
        "TELEFONE",
        "PEDIDOS"
      );

      await addDoc(pedidosFinalizadosRef, {
        ...pedidoFinalizado,
        numeroPedido: pedidoFinalizado.numeroPedido,
      });

      const pedidoOriginalRef = doc(
        db,
        "PEDIDOS RECEBIDOS",
        "TELEFONE",
        "PEDIDOS",
        pedidoFinalizado.numeroPedido
      );
      await deleteDoc(pedidoOriginalRef);

      setPedidoEntregue([...pedidoEntregue, pedidoFinalizado]);

      setPedidoFinalizado((pedidos) =>
        pedidos.filter((p) => p !== pedidoFinalizado)
      );
    } catch (error) {
      console.error("Erro ao mover o pedido finalizado:", error);
    }
  };

  const toggleEnderecoVisivel = () => {
    setEnderecoVisivel(!enderecoVisivel);
  };

  const fecharModal = () => {
    setModalAberto(false);
  };

  return (
    <Container
      sx={{
        height: "100dvh",
        width: "100dvw",
        overflow: "auto",
        margin: 0,
      }}
    >
      <Header />
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          flexWrap: "wrap",
          position: "relative",
          top: "6rem",
          gap: "0.8rem",
        }}
      >
        <Box
          className="box-shadow"
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-evenly",
            alignItems: "center",
            backgroundColor: "#F8F8F8",
            padding: "1rem",
            border: "1px  solid",
            borderRadius: "8px",
            flexGrow: 1,
          }}
        >
          <Typography variant="h6">Quantidade de pedidos hoje:</Typography>
          <Typography variant="h3">10</Typography>
          <VisibilityIcon
            titleAccess="Ver quantidades de pedidos de hoje"
            className="click"
            sx={{ pointerEvents: "pointer" }}
            onClick={() => setModalAberto(true)}
          />

          <Dialog open={modalAberto} onClose={fecharModal}>
            <DialogContent sx={{ padding: 0 }}>
              <Box
                sx={{
                  backgroundColor: "transparent",
                  flex: 1,
                  minWidth: "300px",
                  maxHeight: "30rem",
                  overflow: "auto",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    backgroundColor: "green",
                    borderRadius: "15px",
                    mt: 1,
                  }}
                >
                  Pedidos Entregues
                </Typography>
                {pedidoEntregue.map((pedidoEntregue, index) => (
                  <Box
                    className="box-shadow"
                    key={index}
                    sx={{
                      mt: 1,
                      border: "1px  solid #333",
                      borderRadius: "15px",
                      margin: "0.8rem",
                    }}
                  >
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                      <Typography sx={{ pl: 1, pt: 1 }}>
                        <b>Nome :</b> {pedidoEntregue.DadosPessoais.nome}
                        <br />
                        <b>Telefone :</b>{" "}
                        {pedidoEntregue.DadosPessoais.telefone}
                        <br />
                        <b>Pedido :</b> {pedidoEntregue.numeroPedido}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          width: "100%",
                          alignItems: "center",
                          justifyContent: "space-around",
                          height: "3rem",
                          gap: "1rem",
                        }}
                      >
                        {pedidoEntregue.itens.length > 0 && (
                          <>
                            <FormatListBulletedIcon
                              titleAccess="Itens do pedido"
                              className="click"
                              sx={{
                                cursor: "pointer",
                                color: "blue",
                                "&:hover": {
                                  backgroundColor: "transparent",
                                },
                              }}
                              onClick={() =>
                                setItensVisiveis(
                                  itensVisiveis === pedidoEntregue.itens
                                    ? null
                                    : pedidoEntregue.itens
                                )
                              }
                            />

                            <HomeIcon
                              titleAccess="Endereço do cliente"
                              className="click"
                              sx={{
                                cursor: "pointer",
                                color: "purple",
                                "&:hover": {
                                  backgroundColor: "transparent",
                                },
                              }}
                              onClick={toggleEnderecoVisivel}
                            />
                          </>
                        )}
                      </Box>

                      {itensVisiveis === pedidoEntregue.itens &&
                        pedidoEntregue.itens.length > 0 && (
                          <Typography>
                            {pedidoEntregue.itens.map((item, itemIndex) => (
                              <Typography
                                key={itemIndex}
                                style={{
                                  paddingLeft: "8px",
                                  borderTop: "1px solid black",
                                }}
                              >
                                <b>Item:</b> {item.sabor}
                                <br />
                                <b>Quantidade:</b> {item.quantidade}
                                <br />
                                <b>Ingredientes:</b> {item.ingredientes}
                                <br />
                                <b>Observação:</b> {item.observacao}
                                <br />
                                <b>Valor Do Item:</b> {item.valorTotalDoProduto}
                                <br />
                              </Typography>
                            ))}
                          </Typography>
                        )}
                      {enderecoVisivel && pedidoEntregue && (
                        <Typography
                          style={{
                            paddingLeft: "8px",
                            borderTop: "1px solid black",
                          }}
                        >
                          <b>Endereço :</b>
                          <br />
                          Rua: {enderecoPedidoRecebido.rua}
                          <br />
                          Bairro: {enderecoPedidoRecebido.bairro}
                          <br />
                          Casa/Apto: {enderecoPedidoRecebido.casaApto}
                          <br />
                          CEP: {enderecoPedidoRecebido.cep}
                          <br />
                          Cidade: {enderecoPedidoRecebido.cidade}
                          <br />
                          Complemento: {enderecoPedidoRecebido.complemento}
                          <br />
                          Estado: {enderecoPedidoRecebido.estado}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={fecharModal} color="primary">
                Fechar
              </Button>
            </DialogActions>
          </Dialog>
        </Box>

        <Box
          className="box-shadow"
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-evenly",
            alignItems: "center",
            backgroundColor: "#F8F8F8",
            padding: "1rem",
            border: "1px solid",
            flexGrow: 1,
            borderRadius: "8px",
          }}
        >
          <Typography variant="h6">Pedidos cancelados hoje:</Typography>
          <Typography variant="h3">0</Typography>
          <VisibilityIcon
            titleAccess="Ver quantidades de pedidos cancelados de hoje"
            sx={{ pointerEvents: "pointer" }}
            // onClick={() => setModalAberto(true)}
          />
        </Box>

        <Box
          className="box-shadow"
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-evenly",
            alignItems: "center",
            backgroundColor: "#F8F8F8",
            padding: "1rem",
            border: "1px solid",
            flexGrow: 1,
            borderRadius: "8px",
          }}
        >
          <Typography variant="h6">Recebido hoje:</Typography>
          <Typography variant="h3">R$ 349,00</Typography>
          <VisibilityIcon
            titleAccess="Ver valor recebido hoje"
            sx={{ pointerEvents: "pointer" }}
            // onClick={() => setModalAberto(true)}
          />
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "center",
          flexWrap: "wrap",
          position: "relative",
          top: "6rem",
          gap: "1rem",
          mt: 5,
        }}
      >
        <Box
          sx={{
            backgroundColor: "transparent",
            flex: 1,
            minWidth: "300px",
            maxHeight: "30rem",
            overflow: "auto",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              backgroundColor: "green",
              borderRadius: "15px",
              mt: 1,
            }}
          >
            Pedidos Recebidos
          </Typography>

          {listaDePedidos.map((pedido, index) => (
            <Box
              className="box-shadow"
              key={index}
              sx={{
                mt: 1,
                border: "1px  solid #333",
                borderRadius: "15px",
                margin: "0.8rem",
              }}
            >
              <Typography sx={{ pl: 1, pt: 1 }}>
                <b>Nome :</b> {pedido.DadosPessoais.nome}
                <br />
                <b>Telefone :</b> {pedido.DadosPessoais.telefone}
                <br />
                <b>Pedido :</b> {pedido.numeroPedido}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "space-around",
                  height: "3rem",
                  gap: "1rem",
                }}
              >
                {pedido.itens.length > 0 && (
                  <>
                    <CheckCircleIcon
                      titleAccess="aceitar pedido"
                      className="click"
                      sx={{
                        cursor: "pointer",
                        color: "green",
                        borderRadius: "7px",
                        "&:hover": {
                          backgroundColor: "transparent",
                        },
                      }}
                      onClick={() => prepararPedido(pedido)}
                    />

                    <CancelIcon
                      titleAccess="negar pedido"
                      className="click"
                      sx={{
                        cursor: "pointer",
                        color: "red",
                        "&:hover": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />

                    <FormatListBulletedIcon
                      titleAccess="Itens do pedido"
                      className="click"
                      sx={{
                        cursor: "pointer",
                        color: "blue",
                        "&:hover": {
                          backgroundColor: "transparent",
                        },
                      }}
                      onClick={() =>
                        setItensVisiveis(
                          itensVisiveis === pedido.itens ? null : pedido.itens
                        )
                      }
                    />

                    <HomeIcon
                      titleAccess="Endereço do cliente"
                      className="click"
                      sx={{
                        cursor: "pointer",
                        color: "purple",
                        "&:hover": {
                          backgroundColor: "transparent",
                        },
                      }}
                      onClick={toggleEnderecoVisivel}
                    />
                  </>
                )}
              </Box>

              {itensVisiveis === pedido.itens && pedido.itens.length > 0 && (
                <Box>
                  {pedido.itens.map((item, itemIndex) => (
                    <Typography
                      key={itemIndex}
                      style={{
                        paddingLeft: "8px",
                        borderTop: "1px solid black",
                      }}
                    >
                      <b>Item:</b> {item.sabor}
                      <br />
                      <b>Quantidade:</b> {item.quantidade}
                      <br />
                      <b>Ingredientes:</b> {item.ingredientes}
                      <br />
                      <b>Observação:</b> {item.observacao}
                      <br />
                      <b>Valor Do Item:</b> {item.valorTotalDoProduto}
                      <br />
                    </Typography>
                  ))}
                </Box>
              )}

              {enderecoVisivel && (
                <Typography
                  style={{
                    paddingLeft: "8px",
                    borderTop: "1px solid black",
                  }}
                >
                  <b>Endereço :</b>
                  <br />
                  Rua: {pedido.DadosPessoais.endereco.rua}
                  <br />
                  Bairro: {pedido.DadosPessoais.endereco.bairro}
                  <br />
                  Casa/Apto: {pedido.DadosPessoais.endereco.casaApto}
                  <br />
                  CEP: {pedido.DadosPessoais.endereco.cep}
                  <br />
                  Cidade: {pedido.DadosPessoais.endereco.cidade}
                  <br />
                  Complemento: {pedido.DadosPessoais.endereco.complemento}
                  <br />
                  Estado: {pedido.DadosPessoais.endereco.estado}
                </Typography>
              )}
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            backgroundColor: "transparent",
            flex: 1,
            minWidth: "300px",
            maxHeight: "30rem",
            overflow: "auto",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              backgroundColor: "#E1E4E8",
              borderRadius: "15px",
              mt: 1,
            }}
          >
            Pedido em Preparo
          </Typography>
          {pedidoEmPreparo.map((pedidoEmPreparo, index) => (
            // eslint-disable-next-line react/jsx-key
            <Box
              className="box-shadow"
              key={index}
              sx={{
                mt: 1,
                border: "1px  solid #333",
                borderRadius: "15px",
                margin: "0.8rem",
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography sx={{ pl: 1, pt: 1 }}>
                  <b>Nome :</b> {pedidoEmPreparo.DadosPessoais.nome}
                  <br />
                  <b>Telefone :</b> {pedidoEmPreparo.DadosPessoais.telefone}
                  <br />
                  <b>Pedido :</b> {pedidoEmPreparo.numeroPedido}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "space-around",
                    height: "3rem",
                    gap: "1rem",
                  }}
                >
                  {pedidoEmPreparo.itens.length > 0 && (
                    <>
                      <CheckCircleIcon
                        titleAccess="Pedido pronto"
                        className="click"
                        sx={{
                          cursor: "pointer",
                          color: "green",
                          borderRadius: "7px",
                          "&:hover": {
                            backgroundColor: "transparent",
                          },
                        }}
                        onClick={() => pedidoPronto(pedidoEmPreparo)}
                      />

                      <CancelIcon
                        titleAccess="negar pedido"
                        className="click"
                        sx={{
                          cursor: "pointer",
                          color: "red",
                          "&:hover": {
                            backgroundColor: "transparent",
                          },
                        }}
                      />

                      <FormatListBulletedIcon
                        titleAccess="Itens do pedido"
                        className="click"
                        sx={{
                          cursor: "pointer",
                          color: "blue",
                          "&:hover": {
                            backgroundColor: "transparent",
                          },
                        }}
                        onClick={() =>
                          setItensVisiveis(
                            itensVisiveis === pedidoEmPreparo.itens
                              ? null
                              : pedidoEmPreparo.itens
                          )
                        }
                      />

                      <HomeIcon
                        titleAccess="Endereço do cliente"
                        className="click"
                        sx={{
                          cursor: "pointer",
                          color: "purple",
                          "&:hover": {
                            backgroundColor: "transparent",
                          },
                        }}
                        onClick={toggleEnderecoVisivel}
                      />
                    </>
                  )}
                </Box>

                {itensVisiveis === pedidoEmPreparo.itens &&
                  pedidoEmPreparo.itens.length > 0 && (
                    <Typography>
                      {pedidoEmPreparo.itens.map((item, itemIndex) => (
                        <Typography
                          key={itemIndex}
                          style={{
                            paddingLeft: "8px",
                            borderTop: "1px black solid",
                          }}
                        >
                          <b>Item:</b> {item.sabor}
                          <br />
                          <b>Quantidade:</b> {item.quantidade}
                          <br />
                          <b>Ingredientes:</b> {item.ingredientes}
                          <br />
                          <b>Observação:</b> {item.observacao}
                          <br />
                          <b>Valor Do Item:</b> {item.valorTotalDoProduto}
                          <br />
                        </Typography>
                      ))}
                    </Typography>
                  )}
                {enderecoVisivel && pedidoEmPreparo && (
                  <Typography
                    style={{
                      paddingLeft: "8px",
                      borderTop: "1px black solid",
                    }}
                  >
                    <b>Endereço :</b>
                    <br />
                    Rua: {enderecoPedidoRecebido.rua}
                    <br />
                    Bairro: {enderecoPedidoRecebido.bairro}
                    <br />
                    Casa/Apto: {enderecoPedidoRecebido.casaApto}
                    <br />
                    CEP: {enderecoPedidoRecebido.cep}
                    <br />
                    Cidade: {enderecoPedidoRecebido.cidade}
                    <br />
                    Complemento: {enderecoPedidoRecebido.complemento}
                    <br />
                    Estado: {enderecoPedidoRecebido.estado}
                  </Typography>
                )}
              </Box>
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            backgroundColor: "transparent",
            flex: 1,
            minWidth: "300px",
            maxHeight: "30rem",
            overflow: "auto",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              backgroundColor: "#F9C8C4",
              borderRadius: "15px",
              mt: 1,
            }}
          >
            Pedido Finalizado
          </Typography>
          {pedidoFinalizado.map((pedidoFinalizado, index) => (
            <Box
              className="box-shadow"
              key={index}
              sx={{
                mt: 1,
                border: "1px  solid #333",
                borderRadius: "15px",
                margin: "0.8rem",
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography sx={{ pl: 1, pt: 1 }}>
                  <b>Nome :</b> {pedidoFinalizado.DadosPessoais.nome}
                  <br />
                  <b>Telefone :</b> {pedidoFinalizado.DadosPessoais.telefone}
                  <br />
                  <b>Pedido :</b> {pedidoFinalizado.numeroPedido}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "space-around",
                    height: "3rem",
                    gap: "1rem",
                  }}
                >
                  {pedidoFinalizado.itens.length > 0 && (
                    <>
                      <CheckCircleIcon
                        titleAccess="Mandar pedido"
                        className="click"
                        sx={{
                          cursor: "pointer",
                          color: "green",
                          borderRadius: "7px",
                          "&:hover": {
                            backgroundColor: "transparent",
                          },
                        }}
                        onClick={() =>
                          moverParaPedidosFinalizados(pedidoFinalizado)
                        }
                      />

                      <CancelIcon
                        titleAccess="negar pedido"
                        className="click"
                        sx={{
                          cursor: "pointer",
                          color: "red",
                          "&:hover": {
                            backgroundColor: "transparent",
                          },
                        }}
                      />

                      <FormatListBulletedIcon
                        titleAccess="Itens do pedido"
                        className="click"
                        sx={{
                          cursor: "pointer",
                          color: "blue",
                          "&:hover": {
                            backgroundColor: "transparent",
                          },
                        }}
                        onClick={() =>
                          setItensVisiveis(
                            itensVisiveis === pedidoFinalizado.itens
                              ? null
                              : pedidoFinalizado.itens
                          )
                        }
                      />

                      <HomeIcon
                        titleAccess="Endereço do cliente"
                        className="click"
                        sx={{
                          cursor: "pointer",
                          color: "purple",
                          "&:hover": {
                            backgroundColor: "transparent",
                          },
                        }}
                        onClick={toggleEnderecoVisivel}
                      />
                    </>
                  )}
                </Box>

                {itensVisiveis === pedidoFinalizado.itens &&
                  pedidoFinalizado.itens.length > 0 && (
                    <Typography>
                      {pedidoFinalizado.itens.map((item, itemIndex) => (
                        <Typography
                          key={itemIndex}
                          style={{
                            paddingLeft: "8px",
                            borderTop: "1px black solid",
                          }}
                        >
                          <b>Item:</b> {item.sabor}
                          <br />
                          <b>Quantidade:</b> {item.quantidade}
                          <br />
                          <b>Ingredientes:</b> {item.ingredientes}
                          <br />
                          <b>Observação:</b> {item.observacao}
                          <br />
                          <b>Valor Do Item:</b> {item.valorTotalDoProduto}
                          <br />
                        </Typography>
                      ))}
                    </Typography>
                  )}
                {enderecoVisivel && pedidoFinalizado && (
                  <Typography
                    style={{
                      paddingLeft: "8px",
                      borderTop: "1px black solid",
                    }}
                  >
                    <b>Endereço :</b>
                    <br />
                    Rua: {enderecoPedidoRecebido.rua}
                    <br />
                    Bairro: {enderecoPedidoRecebido.bairro}
                    <br />
                    Casa/Apto: {enderecoPedidoRecebido.casaApto}
                    <br />
                    CEP: {enderecoPedidoRecebido.cep}
                    <br />
                    Cidade: {enderecoPedidoRecebido.cidade}
                    <br />
                    Complemento: {enderecoPedidoRecebido.complemento}
                    <br />
                    Estado: {enderecoPedidoRecebido.estado}
                  </Typography>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Container>
  );
}
