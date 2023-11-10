import { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
  addDoc,
  doc,
  deleteDoc,
  getDocs,
  where,
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
import { startOfDay, endOfDay } from "date-fns";
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
  const [quantidadeDePedidosEntregue, setQuantidadeDePedidosEntregue] =
    useState([]);
  const [valorRecebidoEntrega, setValorRecebidoEntrega] = useState([]);
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
  const buscarPedidosRecebidos = async () => {
    try {
      const pedidosRecebidosRef = collection(
        db,
        "PEDIDOS ENTREGUES",
        "TELEFONE",
        "PEDIDOS"
      );
      const querySnapshot = await getDocs(
        query(
          pedidosRecebidosRef,
          where("dataPedido", ">=", startOfDay(new Date())),
          where("dataPedido", "<=", endOfDay(new Date()))
        )
      );
      const pedidosRecebidos = [];
      querySnapshot.forEach((doc) => {
        const pedido = { id: doc.id, ...doc.data() };
        pedidosRecebidos.push(pedido);
      });
      const valores = pedidosRecebidos.flatMap((item) =>
        item.itens.map((item) => item.valorTotalDoProduto)
      );
      console.log(valores);
      const somaDosValoresEntrega = valores
        .reduce((accumulator, currentValue) => accumulator + currentValue, 0)
        .toFixed(2);
      console.log(somaDosValoresEntrega);
      setValorRecebidoEntrega(somaDosValoresEntrega);
      setQuantidadeDePedidosEntregue(pedidosRecebidos.length);
      setPedidoEntregue(pedidosRecebidos);
      return pedidosRecebidos;
    } catch (error) {
      console.error("Erro ao buscar os pedidos recebidos:", error);
    }
  };

  const handleClick = () => {
    setModalAberto(true);
    buscarPedidosRecebidos();
  };
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

  // ...

  const moverParaPreparo = async (pedido) => {
    try {
      // Referência para a coleção "PEDIDO EM PREPARO"
      const pedidosEmPreparoRef = collection(
        db,
        "PEDIDO EM PREPARO",
        "TELEFONE",
        "PEDIDOS"
      );

      // Adiciona o documento na nova coleção "PEDIDO EM PREPARO"
      await addDoc(pedidosEmPreparoRef, {
        ...pedido,
        numeroPedido: pedido.numeroPedido, // ou qualquer outra informação necessária
      });

      // Remove o documento da coleção original "PEDIDOS RECEBIDOS"
      const pedidoOriginalRef = doc(
        db,
        "PEDIDOS RECEBIDOS",
        "TELEFONE",
        "PEDIDOS",
        pedido.numeroPedido
      );
      await deleteDoc(pedidoOriginalRef);

      // Atualiza o estado local (se necessário)
      setListaDePedidos((pedidos) => pedidos.filter((p) => p !== pedido));
    } catch (error) {
      console.error("Erro ao mover o pedido para preparo:", error);
    }
  };

  // ...

  const prepararPedido = (pedido) => {
    // Chama a função para mover o pedido para a coleção "PEDIDO EM PREPARO"
    moverParaPreparo(pedido);
    // Atualiza o estado local ou realiza outras ações necessárias
    setPedidoEmPreparo([...pedidoEmPreparo, pedido]);
  };

  const moverParaPedidosEntregues = async (pedidoFinalizado) => {
    try {
      // Referência para a coleção "PEDIDOS ENTREGUES"
      const pedidosEntreguesRef = collection(
        db,
        "PEDIDOS ENTREGUES",
        "TELEFONE",
        "PEDIDOS"
      );

      // Adiciona o documento na nova coleção "PEDIDOS ENTREGUES"
      const docRef = await addDoc(pedidosEntreguesRef, {
        ...pedidoFinalizado,
        numeroPedido: pedidoFinalizado.numeroPedido, // ou qualquer outra informação necessária
      });

      // Atualiza o estado local (se necessário)
      setPedidoEntregue((pedidos) => [
        ...pedidos,
        { ...pedidoFinalizado, id: docRef.id },
      ]);

      // Agora, remova o documento da coleção "PEDIDO FINALIZADO"
      const pedidoFinalizadoRef = doc(
        db,
        "PEDIDO FINALIZADO",
        "TELEFONE",
        "PEDIDOS",
        pedidoFinalizado.id // Certifique-se de ajustar conforme sua estrutura de dados
      );
      await deleteDoc(pedidoFinalizadoRef);

      // Atualiza o estado local dos pedidos finalizados após a remoção
      buscarPedidosRecebidos();
    } catch (error) {
      console.error("Erro ao mover o pedido para entregues:", error);
    }
  };

  const moverParaPedidosFinalizados = async (pedidoFinalizado) => {
    try {
      const pedidosFinalizadosRef = collection(
        db,
        "PEDIDO FINALIZADO",
        "TELEFONE",
        "PEDIDOS"
      );

      // Adiciona o documento na nova coleção "PEDIDO FINALIZADO"
      const docRef = await addDoc(pedidosFinalizadosRef, {
        ...pedidoFinalizado,
        numeroPedido: pedidoFinalizado.numeroPedido,
      });

      // Atualiza o estado local (se necessário)
      setPedidoFinalizado((pedidos) => [
        ...pedidos,
        { ...pedidoFinalizado, id: docRef.id },
      ]);

      // Agora, remova o documento da coleção "PEDIDO EM PREPARO"
      const pedidoEmPreparoRef = doc(
        db,
        "PEDIDO EM PREPARO",
        "TELEFONE",
        "PEDIDOS",
        pedidoFinalizado.numeroPedido // Ajuste conforme o campo correto para identificação
      );
      await deleteDoc(pedidoEmPreparoRef);

      // Atualiza o estado local dos pedidos em preparo após a remoção
    } catch (error) {
      console.error("Erro ao mover o pedido finalizado:", error);
    }
  };

  const buscarPedidosEmPreparo = async () => {
    try {
      // Busca os pedidos em preparo
      const pedidosEmPreparoRef = collection(
        db,
        "PEDIDO EM PREPARO",
        "TELEFONE",
        "PEDIDOS"
      );
      const pedidosEmPreparoSnapshot = await getDocs(pedidosEmPreparoRef);
      const pedidosEmPreparoData = pedidosEmPreparoSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Busca os pedidos finalizados
      const pedidosFinalizadosRef = collection(
        db,
        "PEDIDO FINALIZADO",
        "TELEFONE",
        "PEDIDOS"
      );
      const pedidosFinalizadosSnapshot = await getDocs(pedidosFinalizadosRef);
      const pedidosFinalizadosData = pedidosFinalizadosSnapshot.docs.map(
        (doc) => ({
          id: doc.id,
          ...doc.data(),
        })
      );

      // Identifica os IDs dos pedidos em preparo que também estão finalizados
      const idsPedidosEmPreparoExcluir = pedidosEmPreparoData
        .filter((pedidoEmPreparo) =>
          pedidosFinalizadosData.some(
            (pedidoFinalizado) =>
              pedidoFinalizado.numeroPedido === pedidoEmPreparo.numeroPedido
          )
        )
        .map((pedidoEmPreparo) => pedidoEmPreparo.id);

      // Exclui os pedidos em preparo que também estão finalizados
      await Promise.all(
        idsPedidosEmPreparoExcluir.map(async (idPedidoEmPreparo) => {
          const pedidoEmPreparoRef = doc(
            db,
            "PEDIDO EM PREPARO",
            "TELEFONE",
            "PEDIDOS",
            idPedidoEmPreparo
          );
          await deleteDoc(pedidoEmPreparoRef);
        })
      );

      // Filtra os pedidos em preparo para manter apenas aqueles que não existem em PEDIDO FINALIZADO
      const pedidosEmPreparoFiltrados = pedidosEmPreparoData.filter(
        (pedidoEmPreparo) =>
          !pedidosFinalizadosData.some(
            (pedidoFinalizado) =>
              pedidoFinalizado.numeroPedido === pedidoEmPreparo.numeroPedido
          )
      );

      console.log("numero do pedido", pedidosEmPreparoFiltrados);
      setPedidoEmPreparo(pedidosEmPreparoFiltrados);
    } catch (error) {
      console.error("Erro ao buscar pedidos em preparo:", error);
    }
  };

  const buscarPedidosFinalizado = async () => {
    try {
      const pedidosEmPreparoRef = collection(
        db,
        "PEDIDO FINALIZADO",
        "TELEFONE",
        "PEDIDOS"
      );
      const querySnapshot = await getDocs(pedidosEmPreparoRef);
      const pedidosEmPreparoData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPedidoFinalizado(pedidosEmPreparoData);
    } catch (error) {
      console.error("Erro ao buscar pedidos em preparo:", error);
    }
  };

  const pedidoPronto = async () => {
    try {
      if (pedidoEmPreparo.length > 0) {
        const pedidoFinal = pedidoEmPreparo[0];

        // Mover o pedido para a coleção "PEDIDO FINALIZADO"
        await moverParaPedidosFinalizados(pedidoFinal);

        // Atualizar o estado local removendo o pedido da lista em preparo
        setPedidoEmPreparo((pedidosEmPreparo) => pedidosEmPreparo.slice(1));
      }
    } catch (error) {
      console.error("Erro ao processar pedido pronto:", error);
    }
  };
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "PEDIDOS ENTREGUES", "TELEFONE", "PEDIDOS"),
      (snapshot) => {
        const pedidosEntreguesData = snapshot.docs.map((doc) => doc.data());

        const pedidosExcluir = listaDePedidos.filter((pedido) =>
          pedidosEntreguesData.some(
            (pedidoEntregue) =>
              pedidoEntregue.numeroPedido === pedido.numeroPedido
          )
        );

        // Exclui os pedidos que também foram entregues
        pedidosExcluir.forEach(async (pedido) => {
          // Exclui da coleção "PEDIDO EM PREPARO"
          const pedidoEmPreparoRef = collection(
            db,
            "PEDIDO EM PREPARO",
            "TELEFONE",
            "PEDIDOS"
          );
          const pedidoEmPreparoQuery = query(
            pedidoEmPreparoRef,
            where("numeroPedido", "==", pedido.numeroPedido)
          );
          const pedidoEmPreparoSnapshot = await getDocs(pedidoEmPreparoQuery);

          pedidoEmPreparoSnapshot.forEach(async (doc) => {
            await deleteDoc(doc.ref);
          });

          // Exclui da coleção "PEDIDO FINALIZADO"
          const pedidoFinalizadoRef = collection(
            db,
            "PEDIDO FINALIZADO",
            "TELEFONE",
            "PEDIDOS"
          );
          const pedidoFinalizadoQuery = query(
            pedidoFinalizadoRef,
            where("numeroPedido", "==", pedido.numeroPedido)
          );
          const pedidoFinalizadoSnapshot = await getDocs(pedidoFinalizadoQuery);

          pedidoFinalizadoSnapshot.forEach(async (doc) => {
            await deleteDoc(doc.ref);
          });
        });
      }
    );

    return () => unsubscribe();
  }, [listaDePedidos, db]);

  useEffect(() => {
    fetchPedidos();
    buscarPedidosRecebidos();
    buscarPedidosEmPreparo();
    buscarPedidosFinalizado();
  }, []);

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
          <Typography variant="h3">{quantidadeDePedidosEntregue}</Typography>
          <VisibilityIcon
            titleAccess="Ver quantidades de pedidos de hoje"
            className="click"
            sx={{ pointerEvents: "pointer" }}
            onClick={handleClick}
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
            sx={{ pointerEvents: "pointer", visibility: "hidden" }}
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
          <Typography variant="h3">R$ {valorRecebidoEntrega}</Typography>
          <VisibilityIcon
            titleAccess="Ver valor recebido hoje"
            sx={{ pointerEvents: "pointer", visibility: "hidden" }}
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
                          moverParaPedidosEntregues(pedidoFinalizado)
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
