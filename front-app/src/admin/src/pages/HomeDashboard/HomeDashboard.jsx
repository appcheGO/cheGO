/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
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
  orderBy,
} from "firebase/firestore";
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
// import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import HomeIcon from "@mui/icons-material/Home";
import LocalPrintshopRoundedIcon from "@mui/icons-material/LocalPrintshopRounded";
import FormatListBulletedRoundedIcon from "@mui/icons-material/FormatListBulletedRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import Header from "../../components/Header/Header";
import app from "../../../../Firebase/firebase";

export default function HomeDashboard() {
  const db = getFirestore(app);

  const [modalAberto, setModalAberto] = useState(false);
  const [quantidadeDePedidosEntregue, setQuantidadeDePedidosEntregue] =
    useState([]);
  const [valorRecebidoEntrega, setValorRecebidoEntrega] = useState([]);
  const [pedidoEntregue, setPedidoEntregue] = useState([]);
  const [pedidoEmPreparo, setPedidoEmPreparo] = useState([]);
  const [pedidoFinalizado, setPedidoFinalizado] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [pedidoCancelado, setPedidoCancelado] = useState([]);
  const [itensVisiveisPorPedido, setItensVisiveisPorPedido] = useState({});
  const [enderecoVisivelPorPedido, setEnderecoVisivelPorPedido] = useState({});
  const [listaDePedidos, setListaDePedidos] = useState([]);

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

      const somaDosValoresEntrega = valores
        .reduce((accumulator, currentValue) => accumulator + currentValue, 0)
        .toFixed(2);

      setValorRecebidoEntrega(somaDosValoresEntrega);
      setQuantidadeDePedidosEntregue(pedidosRecebidos.length);
      setPedidoEntregue(pedidosRecebidos);
      return pedidosRecebidos;
    } catch (error) {
      console.error("Erro ao buscar os pedidos recebidos:", error);
    }
  };

  /*const handleClick = () => {
    setModalAberto(true);
    buscarPedidosRecebidos();
  };*/
  const fetchPedidos = async () => {
    const ordersQuery = query(
      collection(db, "PEDIDOS RECEBIDOS", "TELEFONE", "PEDIDOS"),
      orderBy("dataPedido", "desc")
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
    try {
      const mensagemCliente = `Olá ${pedido.DadosPessoais.nome}, seu pedido foi aceito e está em preparo!😍 Agradecemos pela preferência.`;

      sendWhatsappMessage(pedido.DadosPessoais.telefone, mensagemCliente);
    } catch (error) {
      console.error(
        "Erro ao preparar pedido ou enviar mensagem para o cliente:",
        error
      );
    }
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
      const retiradaDoPedido = pedidoFinalizado.DadosPessoais.formaDeEntrega;
      const numeroTelefone = pedidoFinalizado.DadosPessoais.telefone;
      const mensagemEntrega = encodeURIComponent(
        `${pedidoFinalizado.DadosPessoais.nome}, vim trazer a melhor notícia do dia, seu pedido saiu para a entrega! 🏍️`
      );
      const mensagemRetirada = encodeURIComponent(
        `${pedidoFinalizado.DadosPessoais.nome}, vim trazer a melhor notícia do dia, seu pedido está pronto para ser retirado!`
      );
      if (retiradaDoPedido === "Entrega") {
        const linkWhatsapp = `https://api.whatsapp.com/send?phone=55${numeroTelefone}&text=${mensagemEntrega}`;
        window.open(linkWhatsapp, "_blank");
      } else {
        const linkWhatsapp = `https://api.whatsapp.com/send?phone=55${numeroTelefone}&text=${mensagemRetirada}`;
        window.open(linkWhatsapp, "_blank");
      }
      window.location.reload();
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
  const corPorFormaDeEntrega = {
    Entrega: "#5c6bc0",
    Retirada: "#26a69a",
  };
  const corPorFormaDePagamento = {
    Credito: "#8d6e63",
    Debito: "#ff3d00",
    Pix: "#ffa726",
    Dinheiro: "#66bb6a",
  };
  const sendWhatsappMessage = (telefone, mensagem) => {
    const numeroLimpo = telefone.replace(/\D/g, "");
    const linkWhatsapp = `https://wa.me/55${numeroLimpo}?text=${encodeURIComponent(
      mensagem
    )}`;

    window.open(linkWhatsapp, "_blank");
  };

  const imprimirPedido = (pedido) => {
    const conteudoPedido = formatarDadosPedido(pedido);

    const janelaImpressao = window.open("", "_blank", "width=600,height=600");
    janelaImpressao.document.write(conteudoPedido);
    janelaImpressao.document.close();
    janelaImpressao.print();
  };

  const formatarDadosPedido = (pedido) => {
    const {
      numeroPedido,
      DadosPessoais: { nome, telefone },
      itens,
    } = pedido;

    let somaTotalItens = 0;

    const conteudoFormatado = `
      <style>
        @media print {
          body {
            font-family: Arial, sans-serif;
            font-size: 12pt;
            line-height: 1.6;
            margin: 0;
            padding: 0;
          }
  
          .imprimir-conteudo {
            margin: 1cm;
          }
  
          .no-print {
            display: none;
          }
        }
      </style>
  
      <div class="imprimir-conteudo">
        Cliente: ${nome}<br/>
        Telefone: ${telefone}<br/>
        ---------------------------------------<br/>
        Pedido: ${numeroPedido}<br/>
        ---------------------------------------<br/>
        ${itens
          .map((item) => {
            somaTotalItens += calcularTotalItem(item);

            return formatarDadosItem(item);
          })
          .join("")}
        
              </div>
  
      <button class="no-print" onclick="window.print()">Imprimir</button>
    `;

    return conteudoFormatado;
  };

  const calcularTotalItem = (item) => {
    let somaTotalItem = item.valor + item.valorOpcional;

    let somaAdicionais = 0;
    if (item.adicionais.length > 0) {
      somaAdicionais = item.adicionais.reduce(
        (total, adicional) => total + adicional.valor * adicional.qtde,
        0
      );
      somaTotalItem += somaAdicionais;
    }

    return somaTotalItem;
  };

  const formatarDadosItem = (item) => {
    let conteudo = `
      Item: ${item.sabor}
            `;

    if (item.refrigeranteDoCombo) {
      conteudo += `<br/>Refrigerante do Combo: ${item.refrigeranteDoCombo}`;
    }

    if (item.opcionalSelecionado) {
      conteudo += `<br/>Opcional: ${item.opcionalSelecionado}<br/>`;
    }
    if (item.adicionais.length > 0) {
      conteudo += `Adicionais:<br/> ${item.adicionais
        .map((adicional) => {
          return `${adicional.name} - (${adicional.qtde}x) `;
        })
        .join("<br/>")}<br/>`;
    }
    if (
      item.ingredientes &&
      item.ingredientes.toLowerCase().includes("bebida")
    ) {
      conteudo += "<br/>";
    }

    conteudo += `Quantidade: ${item.quantidade}`;
    if (item.observacao) {
      conteudo += `<br/>Observação: ${item.observacao}`;
    }

    conteudo += `<br/>---------------------------------------<br/>`;
    return conteudo;
  };

  const formatarDadosItemEntregador = (item) => {
    let conteudo = `
      Item: ${item.sabor}<br/>
      Quantidade: ${item.quantidade}<br/>
      Valor (a): ${useFormat(item.valor)}`;

    if (item.refrigeranteDoCombo) {
      conteudo += `<br/>Refrigerante do Combo: ${item.refrigeranteDoCombo}`;
    }

    if (item.opcionalSelecionado) {
      conteudo += `<br/>Opcional: ${item.opcionalSelecionado}`;
    }

    if (item.valorOpcional == 0) {
      conteudo += `<br/>Valor do Opcional (b): Grátis`;
    } else {
      conteudo += `<br/>Valor do Opcional (b): ${useFormat(
        item.valorOpcional
      )}`;
    }

    let somaAdicionais = 0;
    if (item.adicionais.length > 0) {
      conteudo += `<br/>Adicionais (c):<br/> ${item.adicionais
        .map((adicional) => {
          somaAdicionais += adicional.valor;
          return `${adicional.name} - (${adicional.qtde}x) - (R$ ${adicional.valor})`;
        })
        .join("<br/>")}`;

      const somaTotalItem = calcularTotalItem(item);
      conteudo += `<br/>Total do item (a + b + c): ${useFormat(somaTotalItem)}`;
    } else {
      conteudo += `<br/>Total do item (a + b): ${useFormat(
        item.valor + item.valorOpcional
      )}`;
    }

    if (item.observacao) {
      conteudo += `<br/>Observação: ${item.observacao}`;
    }

    conteudo += `<br/>---------------------------------------<br/>`;

    return conteudo;
  };

  const formatarDadosCompleto = (pedido) => {
    const {
      numeroPedido,
      DadosPessoais: {
        nome,
        telefone,
        endereco,
        formaDeEntrega,
        troco,
        formaDePagamento,
      },
      itens,
    } = pedido;

    let somaTotalItens = 0;

    const itensFormatados = itens.map((item) => {
      somaTotalItens += calcularTotalItem(item);

      return formatarDadosItemEntregador(item);
    });

    let enderecoFormatado = "";
    if (formaDeEntrega === "Entrega") {
      enderecoFormatado = `
          ---------------------------------------<br/>
          CEP: ${endereco.cep}<br/>
          Rua: ${endereco.rua}<br/>
          Casa: ${endereco.casaApto}<br/>
          ${
            endereco.complemento
              ? `Complemento: ${endereco.complemento}<br/>`
              : ""
          }
          Bairro: ${endereco.bairro}<br/>
          Cidade: ${endereco.cidade}<br/>
          Estado: ${endereco.estado}<br/>
          ---------------------------------------<br/>
        `;
    }
    let trocoDaCompra = "";
    if (troco && (troco === 0 || troco === "0" || troco.includes("R$"))) {
      trocoDaCompra = `
          Troco: ${troco}<br/>
          ---------------------------------------<br/>
      `;
    } else {
      trocoDaCompra = "";
    }

    const conteudoFormatado = `
      <style>
        @media print {
          body {
            font-family: Arial, sans-serif;
            font-size: 12pt;
            line-height: 1.6;
            margin: 0;
            padding: 0;
          }

          .imprimir-conteudo {
            margin: 1cm;
          }

          .no-print {
            display: none;
          }
        }
      </style>

      <div class="imprimir-conteudo">
        Cliente: ${nome}<br/>
        Telefone: ${telefone}<br/>
                ${enderecoFormatado}
        Pedido: ${numeroPedido}<br/>
        ---------------------------------------<br/>
        ${itensFormatados.join("")}
        Total do Pedido: ${useFormat(somaTotalItens)}<br/>
         ${trocoDaCompra}
         Forma de pagamento: ${formaDePagamento}
      </div>

      <button class="no-print" onclick="window.print()">Imprimir</button>
    `;

    return conteudoFormatado;
  };

  const useFormat = (valor) => {
    return `R$ ${valor.toFixed(2)}`;
  };

  const imprimirPedidoEntregador = (pedido) => {
    const conteudoPedido = formatarDadosCompleto(pedido);

    const janelaImpressao = window.open("", "_blank", "width=600,height=600");
    janelaImpressao.document.write(conteudoPedido);
    janelaImpressao.document.close();
    janelaImpressao.print();
  };
  const moverRecebidosParaCancelados = async (pedido) => {
    try {
      const pedidosEmPreparoRef = collection(
        db,
        "PEDIDOS CANCELADOS",
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
  /*  const moverEmPreparoParaCancelados = async (pedidoEmPreparo) => {
    try {
      const pedidosCanceladosRef = collection(
        db,
        "PEDIDOS CANCELADOS",
        "TELEFONE",
        "PEDIDOS"
      );

      const docRef = await addDoc(pedidosCanceladosRef, {
        ...pedidoEmPreparo,
        numeroPedido: pedidoEmPreparo.numeroPedido,
      });

      const pedidoEmPreparoRef = doc(
        db,
        "PEDIDO EM PREPARO",
        "TELEFONE",
        "PEDIDOS",
        pedidoEmPreparo.id
      );
      await deleteDoc(pedidoEmPreparoRef);

      setPedidoEmPreparo((pedidosEmPreparo) =>
        pedidosEmPreparo.filter((pedido) => pedido !== pedidoEmPreparo)
      );

      setPedidoCancelado((pedidos) => [
        ...pedidos,
        { ...pedidoEmPreparo, id: docRef.id },
      ]);
    } catch (error) {
      console.error(
        "Erro ao mover o pedido em preparo para cancelados:",
        error
      );
    }
  };*/
  const iniciarConversaWhatsApp = (numeroTelefone) => {
    // Remova caracteres não numéricos do número de telefone
    const numeroLimpo = numeroTelefone.replace(/\D/g, "");

    // Crie o link do WhatsApp com o número de telefone
    const linkWhatsApp = `https://wa.me/55${numeroLimpo}`;
    // Abra o link em uma nova janela ou guia
    window.open(linkWhatsApp, "_blank");
  };

  return (
    <Container
      className="backgroundAdmin"
      sx={{
        height: "100dvh",
        width: "100dvw",
        maxWidth: "none !important",
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
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
          top: "2rem",
          gap: "1rem",
          width: "95%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-evenly",
            alignItems: "center",
            padding: "1rem",
            border: "1px  solid",
            borderRadius: "8px",
            flex: 1,
            minWidth: "300px",
            height: "7rem",
            backgroundColor: "#1E2C39",
            color: "#FFFFFF",
            boxShadow:
              "11px 9px 11px -3px rgba(0, 0, 0, 0.1), 0px 10px 15px -3px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Typography variant="h6">Quantidade de pedidos hoje:</Typography>
          <Typography variant="h4">{quantidadeDePedidosEntregue}</Typography>
          {/*<VisibilityIcon
          
            titleAccess="Ver quantidades de pedidos de hoje"
            className="click"
            sx={{ pointerEvents: "pointer" }}
            onClick={handleClick}
          />*/}

          <Dialog open={modalAberto} onClose={fecharModal}>
            <DialogContent sx={{ padding: 0 }}>
              <Box
                sx={{
                  backgroundColor: "transparent",
                  flex: 1,
                  minWidth: "300px",
                  maxHeight: "23.7rem",
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
                    key={index}
                    sx={{
                      mt: 1,
                      border: "1px  solid #333",
                      borderRadius: "15px",
                      margin: "0.8rem",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyItems: "center",
                          width: "100%",
                          height: "2rem",
                          gap: "1rem",
                          pl: 1,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor:
                              corPorFormaDeEntrega[
                                pedidoEntregue.DadosPessoais.formaDeEntrega
                              ],
                            borderRadius: "15px",
                            width: "5rem",
                          }}
                        >
                          <Typography variant="body2" sx={{ color: "white" }}>
                            {pedidoEntregue.DadosPessoais.formaDeEntrega}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor:
                              corPorFormaDePagamento[
                                pedidoEntregue.DadosPessoais.formaDePagamento
                              ],
                            borderRadius: "15px",
                            width: "5rem",
                          }}
                        >
                          <Typography variant="body2" sx={{ color: "white" }}>
                            {pedidoEntregue.DadosPessoais.formaDePagamento}
                          </Typography>
                        </Box>
                      </Box>
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
                            <FormatListBulletedRoundedIcon
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

                            {pedidoEntregue.DadosPessoais.formaDeEntrega ==
                            "Retirada" ? (
                              <Box />
                            ) : (
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
                            )}
                          </>
                        )}
                      </Box>

                      {itensVisiveisPorPedido[pedidoEntregue.numeroPedido] ===
                        pedidoEntregue.itens &&
                        pedidoEntregue.itens.length > 0 && (
                          <Box>
                            {pedidoEntregue.DadosPessoais &&
                              pedidoEntregue.itens.map((item, itemIndex) => (
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
                                  {item.valorOpcional === 0 ||
                                  item.valorOpcional === "0" ||
                                  item.valorOpcional === "" ? (
                                    <>
                                      <b>Opcional:</b>
                                      {item.opcionalSelecionado}
                                      <br />
                                      <b>
                                        Valor opcional
                                        <span style={{ fontSize: "0.7rem" }}>
                                          (b)
                                        </span>
                                        :
                                      </b>
                                      Grátis
                                    </>
                                  ) : (
                                    <>
                                      {item.opcionais == 0 ? (
                                        <Box />
                                      ) : (
                                        <>
                                          {" "}
                                          <b>Opcional:</b>
                                          {item.opcionalSelecionado}
                                          <br />
                                          <b>
                                            Valor opcional
                                            <span
                                              style={{ fontSize: "0.7rem" }}
                                            >
                                              (b)
                                            </span>
                                            :
                                          </b>
                                          R$ {item.valorOpcional}
                                        </>
                                      )}
                                    </>
                                  )}
                                  {item.observacao === "" ? (
                                    <Box />
                                  ) : (
                                    <>
                                      <br />
                                      <b>Observação:</b>
                                      {item.observacao}
                                    </>
                                  )}
                                  {item.adicionais.length === 0 ? (
                                    <Box />
                                  ) : (
                                    <>
                                      <b>Adicionais:</b>
                                      <br />
                                      {item.adicionais.map(
                                        (adicional, index) => (
                                          <div key={index}>
                                            <p>
                                              {adicional.name}
                                              -(
                                              {adicional.qtde}
                                              x)
                                            </p>
                                          </div>
                                        )
                                      )}
                                      <b>
                                        Valor Total de adicionais{" "}
                                        <span style={{ fontSize: "0.7rem" }}>
                                          (c)
                                        </span>
                                      </b>
                                      : R${" "}
                                      {item.valorTotalAdicionais.toFixed(2)}
                                      <br />
                                    </>
                                  )}
                                  <b>
                                    Valor Do Item{" "}
                                    <span style={{ fontSize: "0.7rem" }}>
                                      (a)+(b)+(c)
                                    </span>
                                    :
                                  </b>{" "}
                                  R$ {item.valorTotalDoProduto}
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
                              {calcularSomaTotal(pedidoEntregue.itens).toFixed(
                                2
                              )}
                            </Typography>
                            {pedidoEntregue.DadosPessoais.troco === 0 ||
                            pedidoEntregue.DadosPessoais.troco === null ||
                            pedidoEntregue.DadosPessoais.troco === undefined ||
                            pedidoEntregue.DadosPessoais.troco === "0" ? (
                              <Box />
                            ) : (
                              <Typography
                                style={{
                                  backgroundColor: "blue",
                                  paddingLeft: "8px",
                                  borderTop: "1px solid black",
                                  color: "white",
                                }}
                              >
                                Troco para:
                                {pedidoEntregue.DadosPessoais.troco}
                              </Typography>
                            )}
                          </Box>
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
                          Rua: {pedidoEntregue.DadosPessoais.endereco.rua}
                          <br />
                          Bairro: {pedidoEntregue.DadosPessoais.endereco.bairro}
                          <br />
                          Casa/Apto:{" "}
                          {pedidoEntregue.DadosPessoais.endereco.casaApto}
                          <br />
                          CEP: {pedidoEntregue.DadosPessoais.endereco.cep}
                          <br />
                          Cidade: {pedidoEntregue.DadosPessoais.endereco.cidade}
                          <br />
                          Complemento:{" "}
                          {pedidoEntregue.DadosPessoais.endereco.complemento}
                          <br />
                          Estado: {pedidoEntregue.DadosPessoais.endereco.estado}
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
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-evenly",
            alignItems: "center",
            padding: "1rem",
            border: "1px  solid",
            borderRadius: "8px",
            flex: 1,
            minWidth: "300px",
            height: "7rem",
            backgroundColor: "#1E2C39",
            color: "#FFFFFF",
            boxShadow:
              "11px 9px 11px -3px rgba(0, 0, 0, 0.1), 0px 10px 15px -3px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Typography variant="h6">Pedidos cancelados hoje:</Typography>
          <Typography variant="h4">0</Typography>
          {/*<VisibilityIcon
            titleAccess="Ver quantidades de pedidos cancelados de hoje"
            sx={{
              pointerEvents: "pointer",
              visibility: "hidden",
            }}
          />*/}
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-evenly",
            alignItems: "center",
            padding: "1rem",
            border: "1px  solid",
            borderRadius: "8px",
            flex: 1,
            minWidth: "300px",
            height: "7rem",
            backgroundColor: "#1E2C39",
            color: "#FFFFFF",
            boxShadow:
              "11px 9px 11px -3px rgba(0, 0, 0, 0.1), 0px 10px 15px -3px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Typography variant="h6">Recebido hoje:</Typography>
          <Typography variant="h4">R$ {valorRecebidoEntrega}</Typography>
          {/*<VisibilityIcon
            titleAccess="Ver valor recebido hoje"
            sx={{
              pointerEvents: "pointer",
              visibility: "hidden",
            }}
          />*/}
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
          width: "95%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            maxHeight: "29rem",
            minWidth: "300px",
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
              borderRadius: "8px",
              mt: 1,
              color: "#FFFFFF",
            }}
          >
            Pedidos Recebidos
          </Typography>
          <Box
            sx={{
              backgroundColor: "transparent",
              flex: 1,
              maxHeight: "23.7rem",
              overflow: "auto",
            }}
          >
            {listaDePedidos.map((pedido, index) => (
              <Box
                key={index}
                sx={{
                  backgroundColor: "#FFFFFF",
                  mt: 1,
                  border: "1px  solid #333",
                  borderRadius: "15px",
                  margin: "0.8rem",
                  overflow: "hidden",
                  boxShadow: "2px 0px 10px 1px rgba(0, 0, 0, 0.2)",
                }}
              >
                 <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    height: "2rem",
                    pr: 2,
                    pl: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor:
                        corPorFormaDeEntrega[
                          pedido.DadosPessoais.formaDeEntrega
                        ],
                      borderRadius: "15px",
                      width: "5rem",
                    }}
                  >
                    <Typography variant="body2" sx={{ color: "white" }}>
                      {pedido.DadosPessoais.formaDeEntrega}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor:
                        corPorFormaDePagamento[
                          pedido.DadosPessoais.formaDePagamento
                        ],
                      borderRadius: "15px",
                      width: "5rem",
                    }}
                  >
                    <Typography variant="body2" sx={{ color: "white" }}>
                      {pedido.DadosPessoais.formaDePagamento}
                    </Typography>
                  </Box>
                  <LocalPrintshopRoundedIcon
                    titleAccess="Imprimir pedido"
                    sx={{ cursor: "pointer" }}
                    variant="outlined"
                    onClick={() => imprimirPedido(pedido)}
                  />
                  <WhatsAppIcon
                   titleAccess="Chamar cliente"
                    sx={{ cursor: "pointer", color: "green" }}
                    onClick={() =>
                      iniciarConversaWhatsApp(pedido.DadosPessoais.telefone)
                    }
                  />
                </Box>
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
                    justifyContent:
                      pedido.DadosPessoais.formaDeEntrega === "Retirada"
                        ? "space-around"
                        : "space-around",
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
                        onClick={() => moverRecebidosParaCancelados(pedido)}
                      />

                      <FormatListBulletedRoundedIcon
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

                      {pedido.DadosPessoais.formaDeEntrega === "Retirada" ? (
                        <HomeIcon
                          titleAccess="Endereço do cliente"
                          className="click"
                          sx={{
                            display: "none",
                          }}
                          onClick={() =>
                            toggleEnderecoVisivel(pedido.numeroPedido)
                          }
                        />
                      ) : (
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
                            toggleEnderecoVisivel(pedido.numeroPedido)
                          }
                        />
                      )}
                    </>
                  )}
                </Box>

                {itensVisiveisPorPedido[pedido.numeroPedido] === pedido.itens &&
                  pedido.itens.length > 0 && (
                    <Box>
                      {pedido.DadosPessoais &&
                        pedido.itens.map((item, itemIndex) => (
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
                            <b>
                              Valor
                              <span style={{ fontSize: "0.7rem" }}>(a)</span>:
                            </b>{" "}
                            {useFormat(item.valor)}
                            <br />
                            {item.valorOpcional === 0 ||
                            item.valorOpcional === "0" ||
                            item.valorOpcional === "" ? (
                              <>
                                <b>Opcional:</b>
                                {item.opcionalSelecionado}
                                <br />
                                <b>
                                  Valor opcional
                                  <span style={{ fontSize: "0.7rem" }}>
                                    (b)
                                  </span>
                                  :
                                </b>
                                Grátis
                              </>
                            ) : (
                              <>
                                {item.opcionais == 0 ? (
                                  <Box />
                                ) : (
                                  <>
                                    {" "}
                                    <b>Opcional:</b>
                                    {item.opcionalSelecionado}
                                    <br />
                                    <b>
                                      Valor opcional
                                      <span style={{ fontSize: "0.7rem" }}>
                                        (b)
                                      </span>
                                      :
                                    </b>
                                    R$ {item.valorOpcional}
                                  </>
                                )}
                              </>
                            )}
                            {item.observacao === "" ? (
                              <Box />
                            ) : (
                              <>
                                <br />
                                <b>Observação:</b>
                                {item.observacao}
                                <br />
                              </>
                            )}
                            {item.adicionais.length === 0 ? (
                              <Box />
                            ) : (
                              <>
                                <b>Adicionais:</b>
                                <br />
                                {item.adicionais.map((adicional, index) => (
                                  <div key={index}>
                                    <p>
                                      {adicional.name}-(
                                      {adicional.qtde}x)- (
                                      {useFormat(adicional.valor)})
                                    </p>
                                  </div>
                                ))}
                                <b>
                                  Valor Total de adicionais{" "}
                                  <span style={{ fontSize: "0.7rem" }}>
                                    (c)
                                  </span>
                                </b>
                                : R$ {item.valorTotalAdicionais.toFixed(2)}
                                <br />
                              </>
                            )}
                            {item.adicionais.length > 0 ? (
                              <b>
                                Valor Do Item{" "}
                                <span style={{ fontSize: "0.7rem" }}>
                                  (a)+(b)+(c)
                                </span>
                                :
                              </b>
                            ) : (
                              <b>
                                Valor Do Item{" "}
                                <span style={{ fontSize: "0.7rem" }}>
                                  (a)+(b)
                                </span>
                                :
                              </b>
                            )}
                            R$ {item.valorTotalDoProduto.toFixed(2)}
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
                        {calcularSomaTotal(pedido.itens).toFixed(2)}
                      </Typography>
                      {pedido.DadosPessoais.troco === 0 ||
                      pedido.DadosPessoais.troco === null ||
                      pedido.DadosPessoais.troco === undefined ||
                      pedido.DadosPessoais.troco === "0" ? (
                        <Box />
                      ) : (
                        <Typography
                          style={{
                            backgroundColor: "blue",
                            paddingLeft: "8px",
                            borderTop: "1px solid black",
                            color: "white",
                          }}
                        >
                          Troco para:
                          {pedido.DadosPessoais.troco}
                        </Typography>
                      )}
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
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            maxHeight: "29rem",
            minWidth: "300px",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              backgroundColor: "#FF6100",
              borderRadius: "8px",
              mt: 1,
              color: "#FFFFFF",
            }}
          >
            Pedidos Em Preparo
          </Typography>
          <Box
            sx={{
              backgroundColor: "transparent",
              flex: 1,
              maxHeight: "23.7rem",
              overflow: "auto",
            }}
          >
            {pedidoEmPreparo.map((pedidoEmPreparo, index) => (
              <Box
                key={index}
                sx={{
                  backgroundColor: "#FFFFFF",
                  mt: 1,
                  border: "1px  solid #333",
                  borderRadius: "15px",
                  margin: "0.8rem",
                  overflow: "hidden",
                  boxShadow: "2px 0px 10px 1px rgba(0, 0, 0, 0.2)",
                }}
              >
                 <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    height: "2rem",
                    pr: 2,
                    pl: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor:
                        corPorFormaDeEntrega[
                          pedidoEmPreparo.DadosPessoais.formaDeEntrega
                        ],
                      borderRadius: "15px",
                      width: "5rem",
                    }}
                  >
                    <Typography variant="body2" sx={{ color: "white" }}>
                      {pedidoEmPreparo.DadosPessoais.formaDeEntrega}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor:
                        corPorFormaDePagamento[
                          pedidoEmPreparo.DadosPessoais.formaDePagamento
                        ],
                      borderRadius: "15px",
                      width: "5rem",
                    }}
                  >
                    <Typography variant="body2" sx={{ color: "white" }}>
                      {pedidoEmPreparo.DadosPessoais.formaDePagamento}
                    </Typography>
                  </Box>
                  <LocalPrintshopRoundedIcon
                    titleAccess="Imprimir pedido"
                    sx={{ cursor: "pointer" }}
                    variant="outlined"
                    onClick={() => imprimirPedidoEntregador(pedidoEmPreparo)}
                  />
                  <WhatsAppIcon
                   titleAccess="Chamar cliente"
                    sx={{ cursor: "pointer", color: "green" }}
                    onClick={() =>
                      iniciarConversaWhatsApp(
                        pedidoEmPreparo.DadosPessoais.telefone
                      )
                    }
                  />
                </Box>
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
                    justifyContent:
                      pedidoEmPreparo.DadosPessoais.formaDeEntrega ===
                      "Retirada"
                        ? "space-around"
                        : "space-around",
                    height: "3rem",
                    gap: "1rem",
                  }}
                >
                  {pedidoEmPreparo.itens.length > 0 && (
                    <>
                      <CheckCircleIcon
                        titleAccess="Finalizar pedido"
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
        onClick={() =>
          moverEmPreparoParaCancelados(pedidoEmPreparo)
        }
      />*/}

                      <FormatListBulletedRoundedIcon
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

                      {pedidoEmPreparo.DadosPessoais.formaDeEntrega ===
                      "Retirada" ? (
                        <HomeIcon
                          titleAccess="Endereço do cliente"
                          className="click"
                          sx={{
                            display: "none",
                          }}
                          onClick={() =>
                            toggleEnderecoVisivel(pedidoEmPreparo.numeroPedido)
                          }
                        />
                      ) : (
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
                      )}
                    </>
                  )}
                </Box>

                {itensVisiveisPorPedido[pedidoEmPreparo.numeroPedido] ===
                  pedidoEmPreparo.itens &&
                  pedidoEmPreparo.itens.length > 0 && (
                    <Box>
                      {pedidoEmPreparo.DadosPessoais &&
                        pedidoEmPreparo.itens.map((item, itemIndex) => (
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
                            <b>
                              Valor
                              <span style={{ fontSize: "0.7rem" }}>(a)</span>:
                            </b>{" "}
                            {useFormat(item.valor)}
                            <br />
                            {item.valorOpcional === 0 ||
                            item.valorOpcional === "0" ||
                            item.valorOpcional === "" ? (
                              <>
                                <b>Opcional:</b>
                                {item.opcionalSelecionado}
                                <br />
                                <b>
                                  Valor opcional
                                  <span style={{ fontSize: "0.7rem" }}>
                                    (b)
                                  </span>
                                  :
                                </b>
                                Grátis
                              </>
                            ) : (
                              <>
                                {item.opcionais == 0 ? (
                                  <Box />
                                ) : (
                                  <>
                                    {" "}
                                    <b>Opcional:</b>
                                    {item.opcionalSelecionado}
                                    <br />
                                    <b>
                                      Valor opcional
                                      <span style={{ fontSize: "0.7rem" }}>
                                        (b)
                                      </span>
                                      :
                                    </b>
                                    R$ {item.valorOpcional}
                                  </>
                                )}
                              </>
                            )}
                            {item.observacao === "" ? (
                              <Box />
                            ) : (
                              <>
                                <br />
                                <b>Observação:</b>
                                {item.observacao}
                                <br />
                              </>
                            )}
                            {item.adicionais.length === 0 ? (
                              <Box />
                            ) : (
                              <>
                                <b>Adicionais:</b>
                                <br />
                                {item.adicionais.map((adicional, index) => (
                                  <div key={index}>
                                    <p>
                                      {adicional.name}
                                      -(
                                      {adicional.qtde}
                                      x)
                                    </p>
                                  </div>
                                ))}
                                <b>
                                  Valor Total de adicionais{" "}
                                  <span style={{ fontSize: "0.7rem" }}>
                                    (c)
                                  </span>
                                </b>
                                : R$ {item.valorTotalAdicionais.toFixed(2)}
                                <br />
                              </>
                            )}{" "}
                            {item.adicionais.length > 0 ? (
                              <b>
                                Valor Do Item{" "}
                                <span style={{ fontSize: "0.7rem" }}>
                                  (a)+(b)+(c)
                                </span>
                                :
                              </b>
                            ) : (
                              <b>
                                Valor Do Item{" "}
                                <span style={{ fontSize: "0.7rem" }}>
                                  (a)+(b)
                                </span>
                                :
                              </b>
                            )}
                            R$ {item.valorTotalDoProduto.toFixed(2)}
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
                        {calcularSomaTotal(pedidoEmPreparo.itens).toFixed(2)}
                      </Typography>
                      {pedidoEmPreparo.DadosPessoais.troco === 0 ||
                      pedidoEmPreparo.DadosPessoais.troco === null ||
                      pedidoEmPreparo.DadosPessoais.troco === undefined ||
                      pedidoEmPreparo.DadosPessoais.troco === "0" ? (
                        <Box />
                      ) : (
                        <Typography
                          style={{
                            backgroundColor: "blue",
                            paddingLeft: "8px",
                            borderTop: "1px solid black",
                            color: "white",
                          }}
                        >
                          Troco para:
                          {pedidoEmPreparo.DadosPessoais.troco}
                        </Typography>
                      )}
                    </Box>
                  )}

                {enderecoVisivelPorPedido[pedidoEmPreparo.numeroPedido] && (
                  <Typography
                    style={{
                      paddingLeft: "8px",
                      borderTop: "1px solid black",
                    }}
                  >
                    <b>Endereço :</b>
                    <br />
                    Rua: {pedidoEmPreparo.DadosPessoais.endereco.rua}
                    <br />
                    Bairro: {pedidoEmPreparo.DadosPessoais.endereco.bairro}
                    <br />
                    Casa/Apto: {pedidoEmPreparo.DadosPessoais.endereco.casaApto}
                    <br />
                    CEP: {pedidoEmPreparo.DadosPessoais.endereco.cep}
                    <br />
                    Cidade: {pedidoEmPreparo.DadosPessoais.endereco.cidade}
                    <br />
                    Complemento:{" "}
                    {pedidoEmPreparo.DadosPessoais.endereco.complemento}
                    <br />
                    Estado: {pedidoEmPreparo.DadosPessoais.endereco.estado}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            maxHeight: "29rem",
            minWidth: "300px",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              backgroundColor: "orange",
              borderRadius: "8px",
              mt: 1,
              color: "#FFFFFF",
            }}
          >
            Esperando Entregador/Retirada
          </Typography>
          <Box
            sx={{
              backgroundColor: "transparent",
              flex: 1,
              maxHeight: "23.7rem",
              overflow: "auto",
            }}
          >
            {pedidoFinalizado.map((pedidoFinalizado, index) => (
              <Box
                key={index}
                sx={{
                  backgroundColor: "#FFFFFF",
                  mt: 1,
                  border: "1px  solid #333",
                  borderRadius: "15px",
                  margin: "0.8rem",
                  overflow: "hidden",
                  boxShadow: "2px 0px 10px 1px rgba(0, 0, 0, 0.2)",
                }}
              >
                 <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    height: "2rem",
                    pr: 2,
                    pl: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor:
                        corPorFormaDeEntrega[
                          pedidoFinalizado.DadosPessoais.formaDeEntrega
                        ],
                      borderRadius: "15px",
                      width: "5rem",
                    }}
                  >
                    <Typography variant="body2" sx={{ color: "white" }}>
                      {pedidoFinalizado.DadosPessoais.formaDeEntrega}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor:
                        corPorFormaDePagamento[
                          pedidoFinalizado.DadosPessoais.formaDePagamento
                        ],
                      borderRadius: "15px",
                      width: "5rem",
                    }}
                  >
                    <Typography variant="body2" sx={{ color: "white" }}>
                      {pedidoFinalizado.DadosPessoais.formaDePagamento}
                    </Typography>
                  </Box>
                  <LocalPrintshopRoundedIcon
                    titleAccess="Imprimir pedido"
                    sx={{ cursor: "pointer" }}
                    variant="outlined"
                    onClick={() => imprimirPedidoEntregador(pedidoFinalizado)}
                  />
                  <WhatsAppIcon
                   titleAccess="Chamar cliente"
                    sx={{ cursor: "pointer", color: "green" }}
                    onClick={() =>
                      iniciarConversaWhatsApp(
                        pedidoFinalizado.DadosPessoais.telefone
                      )
                    }
                  />
                </Box>
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
                    justifyContent:
                      pedidoFinalizado.DadosPessoais.formaDeEntrega ===
                      "Retirada"
                        ? "space-around"
                        : "space-around",
                    height: "3rem",
                    gap: "1rem",
                  }}
                >
                  {pedidoFinalizado.itens.length > 0 && (
                    <>
                      <CheckCircleIcon
                        titleAccess="Enviar pedido"
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

                      <FormatListBulletedRoundedIcon
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

                      {pedidoFinalizado.DadosPessoais.formaDeEntrega ==
                      "Retirada" ? (
                        <HomeIcon
                          titleAccess="Endereço do cliente"
                          className="click"
                          sx={{
                            display: "none",
                          }}
                          onClick={() =>
                            toggleEnderecoVisivel(pedidoFinalizado.numeroPedido)
                          }
                        />
                      ) : (
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
                      )}
                    </>
                  )}
                </Box>

                {itensVisiveisPorPedido[pedidoFinalizado.numeroPedido] ===
                  pedidoFinalizado.itens &&
                  pedidoFinalizado.itens.length > 0 && (
                    <Box>
                      {pedidoFinalizado.DadosPessoais &&
                        pedidoFinalizado.itens.map((item, itemIndex) => (
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
                            <b>
                              Valor
                              <span style={{ fontSize: "0.7rem" }}>(a)</span>:
                            </b>{" "}
                            {useFormat(item.valor)}
                            <br />
                            {item.valorOpcional === 0 ||
                            item.valorOpcional === "0" ||
                            item.valorOpcional === "" ? (
                              <>
                                <b>Opcional:</b>
                                {item.opcionalSelecionado}
                                <br />
                                <b>
                                  Valor opcional
                                  <span style={{ fontSize: "0.7rem" }}>
                                    (b)
                                  </span>
                                  :
                                </b>
                                Grátis
                              </>
                            ) : (
                              <>
                                {item.opcionais == 0 ? (
                                  <Box />
                                ) : (
                                  <>
                                    {" "}
                                    <b>Opcional:</b>
                                    {item.opcionalSelecionado}
                                    <br />
                                    <b>
                                      Valor opcional
                                      <span style={{ fontSize: "0.7rem" }}>
                                        (b)
                                      </span>
                                      :
                                    </b>
                                    R$ {item.valorOpcional}
                                  </>
                                )}
                              </>
                            )}
                            {item.observacao === "" ? (
                              <Box />
                            ) : (
                              <>
                                <br />
                                <b>Observação:</b>
                                {item.observacao}
                                <br />
                              </>
                            )}
                            {item.adicionais.length === 0 ? (
                              <Box />
                            ) : (
                              <>
                                <b>Adicionais:</b>
                                <br />
                                {item.adicionais.map((adicional, index) => (
                                  <div key={index}>
                                    <p>
                                      {adicional.name}
                                      -(
                                      {adicional.qtde}
                                      x)
                                    </p>
                                  </div>
                                ))}
                                <b>
                                  Valor Total de adicionais{" "}
                                  <span style={{ fontSize: "0.7rem" }}>
                                    (c)
                                  </span>
                                </b>
                                : R$ {item.valorTotalAdicionais.toFixed(2)}
                                <br />
                              </>
                            )}{" "}
                            {item.adicionais.length > 0 ? (
                              <b>
                                Valor Do Item{" "}
                                <span style={{ fontSize: "0.7rem" }}>
                                  (a)+(b)+(c)
                                </span>
                                :
                              </b>
                            ) : (
                              <b>
                                Valor Do Item{" "}
                                <span style={{ fontSize: "0.7rem" }}>
                                  (a)+(b)
                                </span>
                                :
                              </b>
                            )}
                            R$ {item.valorTotalDoProduto.toFixed(2)}
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
                        {calcularSomaTotal(pedidoFinalizado.itens).toFixed(2)}
                      </Typography>
                      {pedidoFinalizado.DadosPessoais.troco === 0 ||
                      pedidoFinalizado.DadosPessoais.troco === null ||
                      pedidoFinalizado.DadosPessoais.troco === undefined ||
                      pedidoFinalizado.DadosPessoais.troco === "0" ? (
                        <Box />
                      ) : (
                        <Typography
                          style={{
                            backgroundColor: "blue",
                            paddingLeft: "8px",
                            borderTop: "1px solid black",
                            color: "white",
                          }}
                        >
                          Troco para:
                          {pedidoFinalizado.DadosPessoais.troco}
                        </Typography>
                      )}
                    </Box>
                  )}

                {enderecoVisivelPorPedido[pedidoFinalizado.numeroPedido] && (
                  <Typography
                    style={{
                      paddingLeft: "8px",
                      borderTop: "1px solid black",
                    }}
                  >
                    <b>Endereço :</b>
                    <br />
                    Rua: {pedidoFinalizado.DadosPessoais.endereco.rua}
                    <br />
                    Bairro: {pedidoFinalizado.DadosPessoais.endereco.bairro}
                    <br />
                    Casa/Apto:{" "}
                    {pedidoFinalizado.DadosPessoais.endereco.casaApto}
                    <br />
                    CEP: {pedidoFinalizado.DadosPessoais.endereco.cep}
                    <br />
                    Cidade: {pedidoFinalizado.DadosPessoais.endereco.cidade}
                    <br />
                    Complemento:{" "}
                    {pedidoFinalizado.DadosPessoais.endereco.complemento}
                    <br />
                    Estado: {pedidoFinalizado.DadosPessoais.endereco.estado}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
