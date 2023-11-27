/* eslint-disable react/jsx-no-undef */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import {
  Box,
  Typography,
  Button,
  Modal,
  FormControlLabel,
  Switch,
  Input,
} from "@mui/material";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import { useFormat } from "../../../../utils/useFormat";
import Header from "../../layouts/dashboard/header";
import EditIcon from "@mui/icons-material/Edit";

const firebaseConfig = {
  apiKey: "AIzaSyCtUEJucj4FgNrJgwLhcpzZ7OJVCqjM8ls",
  authDomain: "testeapp-666bc.firebaseapp.com",
  projectId: "testeapp-666bc",
  storageBucket: "testeapp-666bc.appspot.com",
  messagingSenderId: "273940847816",
  appId: "1:273940847816:web:7d5c1f136cb8cac3c159fd",
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export const Tables = () => {
  const [numMesas, setNumMesas] = useState(0);
  const [mesaStatus, setMesaStatus] = useState({});
  const [showCommandWaiterModal, setShowCommandWaiterModal] = useState(false);
  const [selectedMesa, setSelectedMesa] = useState(null);
  const [pedidosMesa, setPedidosMesa] = useState([]);
  const [dadosPedidoMesa, setDadosPedidoMesa] = useState(null);
  const [showCloseCommandModal, setShowCloseCommandModal] = useState(false);
  const [switchChecked, setSwitchChecked] = useState(false);
  const [editPeopleCount, setEditPeopleCount] = useState(false);
  const [totalSem10Percent, setTotalSem10Percent] = useState(0);
  const [valorPorPessoa, setValorPorPessoa] = useState(0);
  const [showPaymentButtons, setShowPaymentButtons] = useState(false);
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);

  const handleEditPeopleCount = () => {
    setEditPeopleCount(true);
  };
  useEffect(() => {
    const fetchNumMesas = async () => {
      const mesasCollectionRef = collection(firestore, "PEDIDOS MESAS");
      const mesasSnapshot = await getDocs(mesasCollectionRef);
      setNumMesas(mesasSnapshot.size);
    };

    fetchNumMesas();
  }, []);

  useEffect(() => {
    const fetchStatusMesas = async () => {
      const status = {};

      for (let mesa = 1; mesa <= numMesas; mesa++) {
        const statusCollectionRef = collection(
          firestore,
          `PEDIDOS MESAS/MESA ${mesa}/STATUS`
        );
        const consulta = query(statusCollectionRef);

        const resultadoConsulta = await getDocs(consulta);
        if (
          resultadoConsulta.empty ||
          !resultadoConsulta.docs[0].data().Pedido ||
          resultadoConsulta.docs[0].data().Pedido.length === 0
        ) {
          status[mesa] = "LIVRE";
        } else {
          status[mesa] = "OCUPADA";
        }
      }

      setMesaStatus(status);
    };

    fetchStatusMesas();
  }, [numMesas]);
  useEffect(() => {
    if (dadosPedidoMesa) {
      const totalCom10Percent =
        dadosPedidoMesa.Pedido.reduce((total, item) => {
          return (
            total +
            Number(item.item.valor) +
            Number(item.Valoropcional) +
            calcularSomaValoresAdicionais(item.adicional)
          );
        }, 0) * (switchChecked ? 1.1 : 1);

      setTotalSem10Percent(
        dadosPedidoMesa.Pedido.reduce((total, item) => {
          return (
            total +
            Number(item.item.valor) +
            Number(item.Valoropcional) +
            calcularSomaValoresAdicionais(item.adicional)
          );
        }, 0)
      );

      setValorPorPessoa(
        totalCom10Percent / dadosPedidoMesa.quantidadeDePessoasNaMesa
      );
    }
  }, [dadosPedidoMesa, switchChecked]);

  const handleEncerrarMesa = () => {
    setShowAdditionalInfo(true);
    setShowPaymentButtons(true);
  };

  const handleRecebeuPagamento = async () => {
    if (selectedMesa) {
      const statusCollectionRef = collection(
        firestore,
        `PEDIDOS MESAS/MESA ${selectedMesa}/STATUS`
      );

      const consulta = query(statusCollectionRef);
      const resultadoConsulta = await getDocs(consulta);

      if (!resultadoConsulta.empty) {
        const primeiroDocumento = resultadoConsulta.docs[0];

        await updateDoc(primeiroDocumento.ref, {
          Pedido: [],
        });
      }
    }

    setShowPaymentButtons(false);
    setShowAdditionalInfo(false);
    setShowCommandWaiterModal(false);
    setShowCloseCommandModal(false);
  };
  const handleNaoRecebeuPagamento = () => {
    setShowPaymentButtons(false);
    setShowAdditionalInfo(false);
  };
  const handleOpenCommandWaiterModal = async (mesa) => {
    setSelectedMesa(mesa);
    const statusCollectionRef = collection(
      firestore,
      `PEDIDOS MESAS/MESA ${mesa}/STATUS`
    );
    const consulta = query(statusCollectionRef, orderBy("idPedido", "asc"));
    const resultadoConsulta = await getDocs(consulta);

    const primeiroDocumento = resultadoConsulta.docs[0];
    if (primeiroDocumento) {
      const dadosPedido = primeiroDocumento.data();
      setPedidosMesa(dadosPedido.Pedido);
      setDadosPedidoMesa(dadosPedido);
    } else {
      setPedidosMesa([]);
      setDadosPedidoMesa(null);
    }

    setShowCommandWaiterModal(true);
  };

  const handleCloseCommandWaiterModal = () => {
    setSelectedMesa(null);
    setShowCommandWaiterModal(false);
    setPedidosMesa([]);
    setDadosPedidoMesa(null);
  };
  function calcularSomaValoresAdicionais(adicionalItems) {
    let soma = 0;

    adicionalItems.forEach((adicionalItem) => {
      soma += adicionalItem.valor * adicionalItem.qtde;
    });

    return soma;
  }
  const handleRemoveItem = async (index) => {
    const updatedPedidos = [...dadosPedidoMesa.Pedido];

    const removedItem = updatedPedidos.splice(index, 1)[0];

    setDadosPedidoMesa({
      ...dadosPedidoMesa,
      Pedido: updatedPedidos,
    });

    if (removedItem) {
      const statusCollectionRef = collection(
        firestore,
        `PEDIDOS MESAS/MESA ${selectedMesa}/STATUS`
      );

      const consulta = query(statusCollectionRef);

      const resultadoConsulta = await getDocs(consulta);

      if (!resultadoConsulta.empty) {
        const primeiroDocumento = resultadoConsulta.docs[0];
        const dadosPedido = primeiroDocumento.data();

        const itemIndex = dadosPedido.Pedido.findIndex(
          (item) => item.id === removedItem.id
        );

        dadosPedido.Pedido.splice(itemIndex, 1);

        await updateDoc(primeiroDocumento.ref, {
          Pedido: dadosPedido.Pedido,
        });
      }
    }
  };
  const formatarDadosPedidoModal = (dadosPedidoMesa) => {
    const {
      idPedido,
      UsuarioQueIniciouOPedido,
      dataHoraPedido,
      quantidadeDePessoasNaMesa,
      Pedido,
    } = dadosPedidoMesa;

    const conteudoFormatado = `
      Mesa: ${selectedMesa}
      <br/>
      Garçom: ${UsuarioQueIniciouOPedido}
      <br/>
      Inicio do pedido: ${dataHoraPedido}
      <br/>
      Pessoas na mesa: ${quantidadeDePessoasNaMesa}
      <br/>
    ---------------------------------------
      <br/>
    ${Pedido.map(
      (item, index) => `
      Item ${index + 1}:
      <br/>Sabor: ${item.item.sabor || "N/A"}
      <br/>Valor (a): ${item.item.valor ? useFormat(item.item.valor) : "N/A"}
      <br/>Opcionais: ${item.opcionais || "N/A"}
      <br/>Valor do opcional (b): ${
        item.Valoropcional ? useFormat(item.Valoropcional) : "Gratis"
      }<br/>
      
      ${
        item.adicional && item.adicional.length > 0
          ? `
      Adicionais:
              ${item.adicional
                .map(
                  (adicionalItem, adicionalIndex) => `
                  <br/>
            ${adicionalItem.name} - (${adicionalItem.qtde}x) - ${useFormat(
                    adicionalItem.qtde * adicionalItem.valor
                  )}
          `
                )
                .join("")}
    <br/>
      Valor adicional (c): ${useFormat(
        calcularSomaValoresAdicionais(item.adicional)
      )}<br/>
     
  
      Observação: ${item.observacao || "Sem observação"}
      <br/>
      Quantidade: ${item.item.quantidade}
      <br/>
      Valor total do item (a + b + c): ${useFormat(
        calcularSomaValoresAdicionais(item.adicional) +
          Number(item.item.valor) +
          Number(item.Valoropcional)
      )}
      <br/>
      `
          : `
      Valor total do item (a + b): ${useFormat(
        Number(item.item.valor) + Number(item.Valoropcional)
      )}
      <br/>
      `
      }
     
      ---------------------------------------
      <br/>
    `
    ).join("")}
  
    Valor total da comanda: ${useFormat(totalSem10Percent)}
    <br/>
    ${
      switchChecked
        ? `
    Valor dos 10%: ${useFormat(totalSem10Percent * 0.1)}
    <br/>
    Valor total com 10%: ${useFormat(totalSem10Percent * 1.1)}
    <br/>
    Valor por pessoa: ${useFormat(valorPorPessoa)}
    <br/>
    `
        : `
    Valor por pessoa: ${useFormat(valorPorPessoa)}
    <br/>
    `
    }
    `;

    return conteudoFormatado;
  };

  const imprimirPedidoModal = (dadosPedidoMesa) => {
    const conteudoPedido = formatarDadosPedidoModal(dadosPedidoMesa);

    const janelaImpressao = window.open("", "_blank");
    janelaImpressao.document.write(conteudoPedido);
    janelaImpressao.document.close();
    janelaImpressao.print();
  };
  return (
    <Box
      sx={{
        width: "100%",
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        mt: 10,
      }}
    >
      <Header />
      <Box
        display="flex"
        width="100%"
        justifyContent="space-around"
        flexWrap="wrap"
        gap={2}
      >
        {Array.from({ length: numMesas }, (_, index) => index + 1).map(
          (mesa) => (
            <Box
              key={mesa}
              width="9rem"
              height="5rem"
              display="flex"
              flexDirection="row"
              alignItems="center"
              justifyContent="space-around"
              sx={{
                backgroundColor: mesaStatus[mesa] === "LIVRE" ? "green" : "red",
                borderRadius: 1,
              }}
            >
              <Typography sx={{ color: "white" }}>{`Mesa ${mesa}`}</Typography>
              {mesaStatus[mesa] === "LIVRE" ? (
                <Box />
              ) : (
                <FormatListBulletedIcon
                  variant="contained"
                  sx={{ color: "white", cursor: "pointer" }}
                  onClick={() => handleOpenCommandWaiterModal(mesa)}
                />
              )}
            </Box>
          )
        )}
      </Box>

      <Modal
        open={showCommandWaiterModal}
        onClose={handleCloseCommandWaiterModal}
      >
        <Box
          p={2}
          sx={{
            overflow: "auto",
            width: "85%",
            maxWidth: "350px",
            maxHeight: "90%",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "white",
          }}
        >
          <Typography>
            <b style={{ fontSize: "1.25rem" }}>Mesa: </b>
            {selectedMesa}
          </Typography>
          <Box sx={{ width: "100%", border: "1px black solid" }}></Box>
          {dadosPedidoMesa && (
            <>
              <Box>
                <Typography>
                  <b>Pedido:</b> {dadosPedidoMesa.idPedido}
                </Typography>
                <Typography>
                  <b>Garçom:</b> {dadosPedidoMesa.UsuarioQueIniciouOPedido}
                </Typography>
                <Typography>
                  <b>Inicio do pedido:</b> {dadosPedidoMesa.dataHoraPedido}
                </Typography>

                <Typography>
                  <b>Pessoas na mesa:</b>{" "}
                  {dadosPedidoMesa.quantidadeDePessoasNaMesa}
                </Typography>
                <Box sx={{ width: "100%", border: "1px black solid" }}></Box>
                <Box sx={{ width: "100%", height: "100%", overflow: "auto" }}>
                  {dadosPedidoMesa.Pedido.map((item, index) => (
                    <Box key={index}>
                      <Typography>
                        <b>Item:</b> {item.item.sabor}
                      </Typography>
                      <Typography>
                        <b>
                          Valor <span style={{ fontSize: "0.7rem" }}>(a)</span>:{" "}
                        </b>
                        {useFormat(item.item.valor)}
                      </Typography>
                      <Typography>
                        <b>Opcional: </b>
                        {item.opcionais}
                      </Typography>
                      {item.Valoropcional == "" ? (
                        <Typography>
                          <b>
                            Valor do opcional{" "}
                            <span style={{ fontSize: "0.7rem" }}>(b)</span>:
                          </b>{" "}
                          Gratis
                        </Typography>
                      ) : (
                        <Typography>
                          <b>
                            Valor do opcional{" "}
                            <span style={{ fontSize: "0.7rem" }}>(b)</span>:{" "}
                          </b>
                          {useFormat(item.Valoropcional)}
                        </Typography>
                      )}
                      {item.adicional == 0 ? (
                        <Box />
                      ) : (
                        <Typography>
                          <b>Adicionais:</b>
                        </Typography>
                      )}
                      {item.adicional && item.adicional.length > 0 && (
                        <>
                          <ul>
                            {item.adicional.map(
                              (adicionalItem, adicionalIndex) => (
                                // eslint-disable-next-line react/jsx-key
                                <Typography key={adicionalIndex}>
                                  {" "}
                                  <span style={{ fontWeight: "400" }}>
                                    <li style={{ listStyle: "none" }}>
                                      {adicionalItem.name} - (
                                      {adicionalItem.qtde}
                                      x) -{" "}
                                      {useFormat(
                                        adicionalItem.qtde * adicionalItem.valor
                                      )}
                                    </li>
                                  </span>
                                </Typography>
                              )
                            )}
                          </ul>
                          <Typography>
                            <b>
                              Valor adicional{" "}
                              <span style={{ fontSize: "0.7rem" }}>(c)</span>:
                            </b>{" "}
                            {useFormat(
                              calcularSomaValoresAdicionais(item.adicional)
                            )}
                          </Typography>
                        </>
                      )}
                      {item.observacao === "" ? (
                        <Box />
                      ) : (
                        <Typography>
                          <b>Observação:</b>
                          {item.observacao}
                        </Typography>
                      )}
                      <Typography>
                        <b>Quantidade: </b>
                        {item.item.quantidade}
                      </Typography>
                      {item.adicional && item.adicional.length == 0 ? (
                        <Typography>
                          <b>
                            Valor total do item{" "}
                            <span style={{ fontSize: "0.7rem" }}>(a)+(b)</span>:
                          </b>
                          {useFormat(
                            Number(item.item.valor) + Number(item.Valoropcional)
                          )}
                        </Typography>
                      ) : (
                        <Typography>
                          <b>
                            Valor total do item{" "}
                            <span style={{ fontSize: "0.7rem" }}>
                              (a)+(b)+(c)
                            </span>
                            :
                          </b>
                          {useFormat(
                            Number(item.item.valor) +
                              Number(item.Valoropcional) +
                              calcularSomaValoresAdicionais(item.adicional)
                          )}
                        </Typography>
                      )}{" "}
                      <Button
                        sx={{ mb: 1 }}
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleRemoveItem(index)}
                      >
                        Remover Item
                      </Button>
                      <Box
                        sx={{ width: "100%", border: "1px black solid" }}
                      ></Box>
                    </Box>
                  ))}
                </Box>
              </Box>
              {dadosPedidoMesa.Pedido.length > 0 && (
                <>
                  <Typography>
                    <b>Valor total da comanda:</b>{" "}
                    {useFormat(totalSem10Percent)}
                  </Typography>
                  {switchChecked && (
                    <>
                      <Typography>
                        <b>Valor dos 10%:</b>{" "}
                        {useFormat(totalSem10Percent * 0.1)}
                      </Typography>
                      <Typography>
                        <b>Valor total com 10%:</b>{" "}
                        {useFormat(totalSem10Percent * 1.1)}
                      </Typography>
                      <Typography>
                        <b>Valor por pessoa:</b> {useFormat(valorPorPessoa)}
                      </Typography>
                    </>
                  )}
                  {!switchChecked && (
                    <Typography>
                      <b>Valor por pessoa:</b> {useFormat(valorPorPessoa)}
                    </Typography>
                  )}
                </>
              )}
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  mt: 3,
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCloseCommandWaiterModal}
                >
                  Fechar
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => setShowCloseCommandModal(true)}
                >
                  Finalizar comanda
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>

      <Modal
        open={showCloseCommandModal}
        onClose={() => setShowCloseCommandModal(false)}
      >
        <Box
          p={2}
          sx={{
            width: "75%",
            maxWidth: "500px",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "white",
          }}
        >
          {dadosPedidoMesa && (
            <>
              <Typography>
                <b>Garçom:</b> {dadosPedidoMesa.UsuarioQueIniciouOPedido}
              </Typography>
              <Typography>
                <b>Chegada:</b> {dadosPedidoMesa.dataHoraPedido}
              </Typography>
              <Typography sx={{ display: "flex", alignItems: "center" }}>
                <b>Pessoas: </b>{" "}
                {editPeopleCount ? (
                  <>
                    <Input
                      sx={{ width: "2rem" }}
                      value={dadosPedidoMesa.quantidadeDePessoasNaMesa ?? ""}
                      onChange={(e) =>
                        setDadosPedidoMesa({
                          ...dadosPedidoMesa,
                          quantidadeDePessoasNaMesa: e.target.value,
                        })
                      }
                    />

                    <Button
                      variant="contained"
                      color="primary"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        ml: 1,
                        width: "6rem",
                        height: "1.5rem",
                      }}
                      s
                      onClick={() => {
                        setEditPeopleCount(false);
                      }}
                    >
                      Salvar
                    </Button>
                  </>
                ) : (
                  <>
                    {dadosPedidoMesa?.quantidadeDePessoasNaMesa ?? "N/A"}
                    <EditIcon
                      variant="outlined"
                      color="primary"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        ml: 1,
                        width: "1rem",
                        height: "1.2rem",
                        padding: "0",
                        minWidth: "30px",
                        cursor: "pointer",
                      }}
                      startIcon={<EditIcon />}
                      onClick={() => handleEditPeopleCount()}
                    />
                  </>
                )}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row-reverse",
                  alignItems: "start",
                  justifyContent: "space-between",
                }}
              >
                <Typography>
                  <b>Valor total:</b>{" "}
                  {useFormat(
                    dadosPedidoMesa.Pedido.reduce((total, item) => {
                      return (
                        total +
                        Number(item.item.valor) +
                        Number(item.Valoropcional) +
                        calcularSomaValoresAdicionais(item.adicional)
                      );
                    }, 0) * (switchChecked ? 1.1 : 1)
                  )}
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={switchChecked}
                      onChange={(e) => setSwitchChecked(e.target.checked)}
                    />
                  }
                  label="Aplicar 10%"
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                {" "}
                <Button
                  sx={{ width: "100%" }}
                  variant="contained"
                  color="primary"
                  onClick={() => imprimirPedidoModal(dadosPedidoMesa)}
                >
                  Imprimir Pedido
                </Button>
                <Button
                  sx={{ width: "100%" }}
                  variant="contained"
                  color="success"
                  onClick={() => {
                    handleEncerrarMesa();
                  }}
                >
                  Encerrar mesa
                </Button>
              </Box>
            </>
          )}
          {showAdditionalInfo && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                flexWrap: "wrap",
                alignItems: "start",
                justifyContent: "space-between",
                gap: 1,
                borderTop: "1px black solid",
                mt: 1,
              }}
            >
              <Typography sx={{ color: "red" }}>
                Feche a mesa somente após o recebimento do pagamento
              </Typography>
              <Button
                variant="contained"
                color="success"
                onClick={handleRecebeuPagamento}
                sx={{ mt: 1, width: "100%" }}
              >
                Recebi Pagamento
              </Button>
              <Button
                sx={{ width: "100%" }}
                variant="contained"
                color="error"
                onClick={handleNaoRecebeuPagamento}
              >
                Não Recebi Pagamento
              </Button>
            </Box>
          )}
        </Box>
      </Modal>
    </Box>
  );
};
