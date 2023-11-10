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
//import CancelIcon from "@mui/icons-material/Cancel";
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
  const [itensVisiveisPorPedido, setItensVisiveisPorPedido] = useState({});
  const [enderecoVisivelPorPedido, setEnderecoVisivelPorPedido] = useState({});
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
      const pedidosEntreguesRef = collection(
        db,
        "PEDIDOS ENTREGUES",
        "TELEFONE",
        "PEDIDOS"
      );
      const pedidosEntreguesSnapshot = await getDocs(pedidosEntreguesRef);
      const pedidosEntreguesData = pedidosEntreguesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

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

      const idsPedidosFinalizadosExcluir = pedidosFinalizadosData
        .filter((pedidoFinalizado) =>
          pedidosEntreguesData.some(
            (pedidoEntregue) =>
              pedidoEntregue.numeroPedido === pedidoFinalizado.numeroPedido
          )
        )
        .map((pedidoFinalizado) => pedidoFinalizado.id);

      await Promise.all(
        idsPedidosFinalizadosExcluir.map(async (idPedidoFinalizado) => {
          const pedidoFinalizadoRef = doc(
            db,
            "PEDIDO FINALIZADO",
            "TELEFONE",
            "PEDIDOS",
            idPedidoFinalizado
          );
          await deleteDoc(pedidoFinalizadoRef);
        })
      );

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

  const prepararPedido = (pedido) => {
    moverParaPreparo(pedido);

    setPedidoEmPreparo([...pedidoEmPreparo, pedido]);
  };
  const moverParaPreparo = async (pedido) => {
    try {
      const pedidosEmPreparoRef = collection(
        db,
        "PEDIDO EM PREPARO",
        "TELEFONE",
        "PEDIDOS"
      );

      await addDoc(pedidosEmPreparoRef, {
        ...pedido,
        numeroPedido: pedido.numeroPedido,
      });

      const pedidoOriginalRef = doc(
        db,
        "PEDIDOS RECEBIDOS",
        "TELEFONE",
        "PEDIDOS",
        pedido.numeroPedido
      );
      await deleteDoc(pedidoOriginalRef);

      setListaDePedidos((pedidos) => pedidos.filter((p) => p !== pedido));
    } catch (error) {
      console.error("Erro ao mover o pedido para preparo:", error);
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

      const docRef = await addDoc(pedidosFinalizadosRef, {
        ...pedidoFinalizado,
        numeroPedido: pedidoFinalizado.numeroPedido,
      });

      setPedidoFinalizado((pedidos) => [
        ...pedidos,
        { ...pedidoFinalizado, id: docRef.id },
      ]);

      const pedidoEmPreparoRef = doc(
        db,
        "PEDIDO EM PREPARO",
        "TELEFONE",
        "PEDIDOS",
        pedidoFinalizado.numeroPedido
      );
      await deleteDoc(pedidoEmPreparoRef);
    } catch (error) {
      console.error("Erro ao mover o pedido finalizado:", error);
    }
  };

  const moverParaPedidosEntregues = async (pedidoFinalizado) => {
    try {
      const numeroPedido = pedidoFinalizado.numeroPedido;

      const pedidoEmPreparoRef = collection(
        db,
        "PEDIDO EM PREPARO",
        "TELEFONE",
        "PEDIDOS"
      );
      const pedidoEmPreparoQuery = query(
        pedidoEmPreparoRef,
        where("numeroPedido", "==", numeroPedido)
      );
      const pedidoEmPreparoSnapshot = await getDocs(pedidoEmPreparoQuery);

      if (!pedidoEmPreparoSnapshot.empty) {
        const pedidoEmPreparoDoc = pedidoEmPreparoSnapshot.docs[0];
        await deleteDoc(pedidoEmPreparoDoc.ref);
      }

      const pedidosEntreguesRef = collection(
        db,
        "PEDIDOS ENTREGUES",
        "TELEFONE",
        "PEDIDOS"
      );

      const docRef = await addDoc(pedidosEntreguesRef, {
        ...pedidoFinalizado,
        numeroPedido: numeroPedido,
      });

      setPedidoEntregue((pedidos) => [
        ...pedidos,
        { ...pedidoFinalizado, id: docRef.id },
      ]);

      const pedidoFinalizadoRef = doc(
        db,
        "PEDIDO FINALIZADO",
        "TELEFONE",
        "PEDIDOS",
        pedidoFinalizado.id
      );
      await deleteDoc(pedidoFinalizadoRef);

      buscarPedidosRecebidos();
    } catch (error) {
      console.error("Erro ao mover o pedido para entregues:", error);
    }
  };
  const buscarPedidosEmPreparo = async () => {
    try {
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

      const idsPedidosEmPreparoExcluir = pedidosEmPreparoData
        .filter((pedidoEmPreparo) =>
          pedidosFinalizadosData.some(
            (pedidoFinalizado) =>
              pedidoFinalizado.numeroPedido === pedidoEmPreparo.numeroPedido
          )
        )
        .map((pedidoEmPreparo) => pedidoEmPreparo.id);

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
      const pedidosFinalizadoRef = collection(
        db,
        "PEDIDO FINALIZADO",
        "TELEFONE",
        "PEDIDOS"
      );
      const querySnapshot = await getDocs(pedidosFinalizadoRef);
      const pedidosFinalizadoData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      await Promise.all(
        pedidosFinalizadoData.map(async (pedidoFinalizado) => {
          const pedidosEntreguesRef = collection(
            db,
            "PEDIDOS ENTREGUES",
            "TELEFONE",
            "PEDIDOS"
          );
          const pedidosEntreguesQuery = query(
            pedidosEntreguesRef,
            where("numeroPedido", "==", pedidoFinalizado.numeroPedido)
          );
          const pedidosEntreguesSnapshot = await getDocs(pedidosEntreguesQuery);

          if (!pedidosEntreguesSnapshot.empty) {
            const pedidoFinalizadoRef = doc(
              db,
              "PEDIDO FINALIZADO",
              "TELEFONE",
              "PEDIDOS",
              pedidoFinalizado.id
            );
            await deleteDoc(pedidoFinalizadoRef);
          }
        })
      );

      setPedidoFinalizado(pedidosFinalizadoData);
    } catch (error) {
      console.error("Erro ao buscar pedidos finalizados:", error);
    }
  };

  const pedidoPronto = async () => {
    try {
      if (pedidoEmPreparo.length > 0) {
        const pedidoFinal = pedidoEmPreparo[0];

        await moverParaPedidosFinalizados(pedidoFinal);

        setPedidoEmPreparo((pedidosEmPreparo) => pedidosEmPreparo.slice(1));
      }
    } catch (error) {
      console.error("Erro ao processar pedido pronto:", error);
    }
  };

  const toggleEnderecoVisivel = (numeroPedido) => {
    setEnderecoVisivelPorPedido((prevEnderecoVisivel) => ({
      ...prevEnderecoVisivel,
      [numeroPedido]: !prevEnderecoVisivel[numeroPedido],
    }));
  };

  const fecharModal = () => {
    setModalAberto(false);
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

        pedidosExcluir.forEach(async (pedido) => {
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
  const calcularSomaTotal = (itens) => {
    return itens.reduce((total, item) => total + item.valorTotalDoProduto, 0);
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
                      overflow: "hidden",
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
                                setItensVisiveisPorPedido(
                                  (prevItensVisiveis) => ({
                                    ...prevItensVisiveis,
                                    [pedidoEntregue.numeroPedido]:
                                      prevItensVisiveis[
                                        pedidoEntregue.numeroPedido
                                      ]
                                        ? null
                                        : pedidoEntregue.itens,
                                  })
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
                              onClick={() =>
                                toggleEnderecoVisivel(
                                  pedidoEntregue.numeroPedido
                                )
                              }
                            />
                          </>
                        )}
                      </Box>

                      {itensVisiveisPorPedido[pedidoEntregue.numeroPedido] ===
                        pedidoEntregue.itens &&
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
                            <Typography
                              style={{
                                backgroundColor: "green",
                                paddingLeft: "8px",
                                borderTop: "1px solid black",
                                color: "white",
                              }}
                            >
                              Valor Total do pedido: R${" "}
                              {calcularSomaTotal(pedidoEntregue.itens)}
                            </Typography>
                            <Typography
                              style={{
                                backgroundColor: "orange",
                                paddingLeft: "8px",
                                borderTop: "1px solid black",
                                color: "white",
                              }}
                            >
                              Forma de Pagamento:
                            </Typography>
                            <Typography
                              style={{
                                backgroundColor: "blue",
                                paddingLeft: "8px",
                                borderTop: "1px solid black",
                                color: "white",
                              }}
                            >
                              Troco para:
                            </Typography>
                          </Typography>
                        )}
                      {enderecoVisivelPorPedido[
                        pedidoEntregue.numeroPedido
                      ] && (
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
                overflow: "hidden",
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

                    {/*<CancelIcon
                      titleAccess="negar pedido"
                      className="click"
                      sx={{
                        cursor: "pointer",
                        color: "red",
                        "&:hover": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />*/}

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
                        setItensVisiveisPorPedido((prevItensVisiveis) => ({
                          ...prevItensVisiveis,
                          [pedido.numeroPedido]: prevItensVisiveis[
                            pedido.numeroPedido
                          ]
                            ? null
                            : pedido.itens,
                        }))
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
                      onClick={() => toggleEnderecoVisivel(pedido.numeroPedido)}
                    />
                  </>
                )}
              </Box>

              {itensVisiveisPorPedido[pedido.numeroPedido] === pedido.itens &&
                pedido.itens.length > 0 && (
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
                    <Typography
                      style={{
                        backgroundColor: "green",
                        paddingLeft: "8px",
                        borderTop: "1px solid black",
                        color: "white",
                      }}
                    >
                      Valor Total do pedido: R${" "}
                      {calcularSomaTotal(pedido.itens)}
                    </Typography>
                    <Typography
                      style={{
                        backgroundColor: "orange",
                        paddingLeft: "8px",
                        borderTop: "1px solid black",
                        color: "white",
                      }}
                    >
                      Forma de Pagamento:
                    </Typography>
                    <Typography
                      style={{
                        backgroundColor: "blue",
                        paddingLeft: "8px",
                        borderTop: "1px solid black",
                        color: "white",
                      }}
                    >
                      Troco para:
                    </Typography>
                  </Box>
                )}

              {enderecoVisivelPorPedido[pedido.numeroPedido] && (
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
                overflow: "hidden",
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

                      {/*<CancelIcon
                        titleAccess="negar pedido"
                        className="click"
                        sx={{
                          cursor: "pointer",
                          color: "red",
                          "&:hover": {
                            backgroundColor: "transparent",
                          },
                        }}
                      />*/}

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
                          setItensVisiveisPorPedido((prevItensVisiveis) => ({
                            ...prevItensVisiveis,
                            [pedidoEmPreparo.numeroPedido]: prevItensVisiveis[
                              pedidoEmPreparo.numeroPedido
                            ]
                              ? null
                              : pedidoEmPreparo.itens,
                          }))
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
                        onClick={() =>
                          toggleEnderecoVisivel(pedidoEmPreparo.numeroPedido)
                        }
                      />
                    </>
                  )}
                </Box>

                {itensVisiveisPorPedido[pedidoEmPreparo.numeroPedido] ===
                  pedidoEmPreparo.itens &&
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
                      ))}{" "}
                      <Typography
                        style={{
                          backgroundColor: "green",
                          paddingLeft: "8px",
                          borderTop: "1px solid black",
                          color: "white",
                        }}
                      >
                        Valor Total do pedido: R${" "}
                        {calcularSomaTotal(pedidoEmPreparo.itens)}
                      </Typography>
                      <Typography
                        style={{
                          backgroundColor: "orange",
                          paddingLeft: "8px",
                          borderTop: "1px solid black",
                          color: "white",
                        }}
                      >
                        Forma de Pagamento:
                      </Typography>
                      <Typography
                        style={{
                          backgroundColor: "blue",
                          paddingLeft: "8px",
                          borderTop: "1px solid black",
                          color: "white",
                        }}
                      >
                        Troco para:
                      </Typography>
                    </Typography>
                  )}
                {enderecoVisivelPorPedido[pedidoEmPreparo.numeroPedido] && (
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
                overflow: "hidden",
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

                      {/*<CancelIcon
                        titleAccess="negar pedido"
                        className="click"
                        sx={{
                          cursor: "pointer",
                          color: "red",
                          "&:hover": {
                            backgroundColor: "transparent",
                          },
                        }}
                      />*/}

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
                          setItensVisiveisPorPedido((prevItensVisiveis) => ({
                            ...prevItensVisiveis,
                            [pedidoFinalizado.numeroPedido]: prevItensVisiveis[
                              pedidoFinalizado.numeroPedido
                            ]
                              ? null
                              : pedidoFinalizado.itens,
                          }))
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
                        onClick={() =>
                          toggleEnderecoVisivel(pedidoFinalizado.numeroPedido)
                        }
                      />
                    </>
                  )}
                </Box>

                {itensVisiveisPorPedido[pedidoFinalizado.numeroPedido] ===
                  pedidoFinalizado.itens &&
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
                      ))}{" "}
                      <Typography
                        style={{
                          backgroundColor: "green",
                          paddingLeft: "8px",
                          borderTop: "1px solid black",
                          color: "white",
                        }}
                      >
                        Valor Total do pedido: R${" "}
                        {calcularSomaTotal(pedidoFinalizado.itens)}
                      </Typography>
                      <Typography
                        style={{
                          backgroundColor: "orange",
                          paddingLeft: "8px",
                          borderTop: "1px solid black",
                          color: "white",
                        }}
                      >
                        Forma de Pagamento:
                      </Typography>
                      <Typography
                        style={{
                          backgroundColor: "blue",
                          paddingLeft: "8px",
                          borderTop: "1px solid black",
                          color: "white",
                        }}
                      >
                        Troco para:
                      </Typography>
                    </Typography>
                  )}
                {enderecoVisivelPorPedido[pedidoFinalizado.numeroPedido] && (
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
