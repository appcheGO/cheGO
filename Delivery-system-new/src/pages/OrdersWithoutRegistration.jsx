import { Box, Modal, Typography, capitalize } from "@mui/material";
import { useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeliveryDiningOutlinedIcon from "@mui/icons-material/DeliveryDiningOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import { NavLink } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useCarrinho } from "../context/useCarrinho";
import { useFormat } from "../utils/useFormat";
import InputMask from "react-input-mask";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import PixOutlinedIcon from "@mui/icons-material/PixOutlined";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import "./Order.css";

const campoObrigatorio = (
  <Typography variant="caption" style={{ color: "red", marginLeft: "5px" }}>
    Campo obrigatório
  </Typography>
);
const opcaoObrigatoria = (
  <Typography variant="caption" style={{ color: "red", marginLeft: "5px" }}>
    Escolha uma opção
  </Typography>
);

const schema = yup
  .object()
  .shape({
    estado: yup.string(),
    cidade: yup.string(),
    bairro: yup.string(),
    complemento: yup.string(),
    casaApto: yup.string(),
    rua: yup.string(),
    cep: yup.string(),
    telefone: yup.string().required(campoObrigatorio),
    nome: yup.string().required(campoObrigatorio),
    formaDePagamento: yup
      .string()
      .required(opcaoObrigatoria)
      .oneOf(["Credito", "Debito", "Pix", "Dinheiro"], "Opção inválida"),
    formaDeEntrega: yup.string().required(opcaoObrigatoria),
  })
  .test("condicional", null, function (obj) {
    if (obj.formaDeEntrega === "Entrega") {
      return yup
        .object({
          estado: yup.string().required(campoObrigatorio),
          cidade: yup.string().required(campoObrigatorio),
          bairro: yup.string().required(campoObrigatorio),
          casaApto: yup.string().required(campoObrigatorio),
          rua: yup.string().required(campoObrigatorio),
          cep: yup.string().required(campoObrigatorio),
          telefone: yup.string().required(campoObrigatorio),
          nome: yup.string().required(campoObrigatorio),
        })
        .validate(obj);
    } else if (obj.formaDeEntrega === "Retirada") {
      return yup.object().validate(obj);
    }
  });

const Order = () => {
  const { cart, calculateSubtotal } = useCarrinho();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChangeNeeded, setIsChangeNeeded] = useState(false);
  const [changeAmount, setChangeAmount] = useState("");
  const handleConfirmChangeAmount = () => {
    const confirmedChangeAmount = changeAmount;
    setIsModalOpen(false);
    console.log(confirmedChangeAmount);
  };

  const {
    register,
    handleSubmit,
    setValue,
    setFocus,
    getValues,
    formState: { errors },
    control,
  } = useForm({
    resolver: yupResolver(schema),
  });
  const horaAtual = new Date().getHours();

  let saudacao;
  if (horaAtual >= 5 && horaAtual < 12) {
    saudacao = "bom dia";
  } else if (horaAtual >= 12 && horaAtual < 18) {
    saudacao = "boa tarde";
  } else {
    saudacao = "boa noite";
  }

  const createWhatsAppMessage = (data) => {
    const formaDeEntregaEscolhida = data.formaDeEntrega;
    const sessionStorageData = JSON.parse(
      sessionStorage.getItem("itensSelecionados")
    );
    const totalValue = calculateSubtotal(cart);

    if (totalValue === 0) {
      alert(
        "Carrinho vazio. Adicione itens ao carrinho antes de enviar o pedido."
      );
      return;
    }
    const pedidoNumero = Math.floor(Math.random() * 1000);
    const pedidoTexto =
      pedidoNumero <= 99
        ? pedidoNumero.toString().padStart(2, "0")
        : pedidoNumero.toString();

    if (sessionStorageData && formaDeEntregaEscolhida === "Entrega") {
      let message = `Olá ${saudacao},\n\n`;
      message += `Me chamo ${capitalize(data.nome)},\n`;
      message += `meu telefone é: ${data.telefone}\n\n`;
      message += "Esse é o meu pedido:\n";
      message += "---------------------------------------\n";
      message += `Pedido: ${pedidoTexto}\n`;
      message += "---------------------------------------\n";

      sessionStorageData.forEach((item, index) => {
        message += `Item: ${item.sabor}\n`;
        message += `Valor: R$ ${item.valor}\n`;
        message += `Quantidade: ${item.quantidade}\n`;

        if (item.refrigeranteDoCombo) {
          message += `Refrigerante do Combo: ${item.refrigeranteDoCombo}\n`;
        }
        if (item.opicionais) {
          message += `Opcionais: ${item.opicionais}\n`;
        }
        if (
          item.valorSelecionado === undefined ||
          item.valorSelecionado === "" ||
          item.valorSelecionado === 0
        ) {
          message += `Valor do opcional: Grátis\n`;
          console.log(item.valorSelecionado);
        } else {
          message += `Valor do opcional: R$ ${item.valorSelecionado}\n`;
        }

        if (item.adicionais && item.adicionais.length > 0) {
          message += "Adicionais:\n";

          item.adicionais.forEach((adicional, i) => {
            message += `(${adicional.qtde}x) ${adicional.name}`;

            if (i < item.adicionais.length - 1) {
              message += "\n";
            }
          });
        }

        if (item.valorTotalAdicionais) {
          message += `\nValor dos adicionais: R$ ${item.valorTotalAdicionais.toFixed(
            2
          )}\n`;
        }
        message += `Valor total do item: R$ ${item.valorTotalDoProduto.toFixed(
          2
        )}\n`;

        if (item.observacao) {
          message += `Observação: ${item.observacao}\n`;
        }
        if (index < sessionStorageData.length - 1) {
          message += "---------------------------------------\n";
        }
      });

      message += "---------------------------------------\n";
      message += `Endereço :\n`;
      message += `CEP: ${data.cep}\n`;
      message += `Rua: ${data.rua}\n`;
      message += `Numero: ${data.casaApto}\n`;
      if (data.complemento === "") {
        console.log("nao tem complemento");
      } else {
        message += `Ponto de Referencia: ${data.complemento}\n`;
      }
      message += `Bairro: ${data.bairro}\n`;
      message += `Cidade: ${data.cidade}\n`;
      message += `Estado: ${data.estado}\n`;

      message += "---------------------------------------\n";
      message += `Forma de Pagamento: ${data.formaDePagamento}\n`;
      message += `Entrega ou Retirada: ${data.formaDeEntrega}\n`;

      if (isChangeNeeded === false) {
        message += "---------------------------------------\n";
        message += `Valor Total: R$ ${totalValue.toFixed(2)}\n\n`;
      } else {
        message += "---------------------------------------\n";
        message += `Valor Total: R$ ${totalValue.toFixed(2)}\n`;
        message += `Troco para: ${changeAmount}\n\n`;
      }

      console.log(message);

      const encodedMessage = encodeURIComponent(message);
      const whatsappLink = `https://wa.me/5585982168756?text=${encodedMessage}`;
      window.open(whatsappLink);
    } else {
      let message = `Olá ${saudacao},\n\n`;
      message += `Me chamo ${capitalize(data.nome)},\n`;
      message += `meu telefone é: ${data.telefone}\n\n`;
      message += "Esse é o meu pedido:\n";
      message += "---------------------------------------\n";
      message += `Pedido: ${pedidoTexto}\n`;
      message += "---------------------------------------\n";

      sessionStorageData.forEach((item, index) => {
        message += `Item: ${item.sabor}\n`;
        message += `Valor: R$ ${item.valor}\n`;
        message += `Quantidade: ${item.quantidade}\n`;

        if (item.refrigeranteDoCombo) {
          message += `Refrigerante do Combo: ${item.refrigeranteDoCombo}\n`;
        }
        if (item.opicionais) {
          message += `Opcionais: ${item.opicionais}\n`;
        }
        if (
          item.valorSelecionado === undefined ||
          item.valorSelecionado === "" ||
          item.valorSelecionado === 0
        ) {
          message += `Valor do opcional: Grátis\n`;
          console.log(item.valorSelecionado);
        } else {
          message += `Valor do opcional: R$ ${item.valorSelecionado}\n`;
        }
        if (item.adicionais && item.adicionais.length > 0) {
          message += "Adicionais:\n";

          item.adicionais.forEach((adicional, i) => {
            message += `(${adicional.qtde}x) ${adicional.name}`;

            if (i < item.adicionais.length - 1) {
              message += "\n";
            }
          });
        }

        if (item.valorTotalAdicionais) {
          message += `\nValor dos adicionais: R$ ${item.valorTotalAdicionais.toFixed(
            2
          )}\n`;
        }
        message += `Valor total do item: R$ ${item.valorTotalDoProduto.toFixed(
          2
        )}\n`;

        if (item.observacao) {
          message += `Observação: ${item.observacao}\n`;
        }
        if (index < sessionStorageData.length - 1) {
          message += "---------------------------------------\n";
        }
      });

      message += "---------------------------------------\n";
      message += `Forma de Pagamento: ${data.formaDePagamento}\n`;
      message += `Entrega ou Retirada: ${data.formaDeEntrega}\n`;

      if (isChangeNeeded === false) {
        message += "---------------------------------------\n";
        message += `Valor Total: R$ ${totalValue.toFixed(2)}\n\n`;
      } else {
        message += "---------------------------------------\n";
        message += `Valor Total: R$ ${totalValue.toFixed(2)}\n`;
        message += `Troco para: ${changeAmount}\n\n`;
      }

      message += "---------------------------------------\n";
      message +=
        "Ahh escolhi a opção de retirada , então ja sei que o endereco é:\n";
      message +=
        "Rua: Rua das maravilhas\nNúmero: 194\nPonto de referência: próximo ao campo da luz\nCidade: Caucaia\n\n";
      message +=
        "Qualquer duvida eu acesso por essa localização pelo Google Maps:\nhttps://maps.app.goo.gl/6hMUzge2SxM1zGks9";

      console.log(message);

      const encodedMessage = encodeURIComponent(message);
      const whatsappLink = `https://wa.me/5585982168756?text=${encodedMessage}`;
      window.open(whatsappLink);
    }
  };

  const checkCEP = (e) => {
    const cep = e.target.value.replace(/\D/g, "");
    if (cep === "") {
      setValue("address");
      setValue("casaApto");
      setValue("addresscomplement");
      setValue("neighborhood");
      setValue("city");
      setValue("uf");
      console.log(e);
    } else {
      fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then((res) => res.json())
        .then((data) => {
          setValue("cep", data.cep);
          setValue("rua", data.logradouro);
          setValue("bairro", data.bairro);
          setValue("cidade", data.localidade);
          setValue("estado", data.uf);
          setFocus("casaApto");
        });
    }
  };

  const onSubmit = (data) => {
    const totalValue = calculateSubtotal(cart);

    if (totalValue === 0) {
      alert(
        "Carrinho vazio. Adicione itens ao carrinho antes de enviar o pedido."
      );
    }else createWhatsAppMessage(data);
  };

  return (
    <Box
      sx={{
        overflow: "auto",
        position: "relative",
        height: "100dvh",
        width: "100%",
        backgroundColor: "#f46c26",
      }}
    >
      <Box
        sx={{
          height: "8%",
          width: "100%",
          display: "flex",
          flexDirection: " row",
          alignItems: "center",
        }}
      >
        <Box className="iconAndText">
          <NavLink to="/" style={{ color: "#f9e9df" }}>
            <ArrowBackIcon />
          </NavLink>
          <Typography variant="h6">Checkout</Typography>
        </Box>
      </Box>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box
          sx={{
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            height: "74rem",
            backgroundColor: "#f9e9df",
            position: " relative",
            bottom: "0",
            borderRadius: "25px 25px 0 0",
            justifyContent: "flex-start",
          }}
        >
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: "10rem",
            }}
          >
            <Box
              sx={{
                display: " flex",
                width: "100%",
                height: " 100%",
                alignContent: "stretch",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  width: "13rem",
                  height: "2.08rem",
                  background: "rgba(0, 0, 0, 0.87)",
                  borderRadius: "0 30px 0px 0px",
                }}
              ></Box>
              <Typography variant="h6" className="editInformation">
                Quem pediu
              </Typography>
              <Box
                sx={{
                  height: "100%",
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: " flex-start",
                  justifyContent: "space-evenly",
                  paddingLeft: "16px",
                  color: "#070707",
                }}
              >
                <Typography
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                  }}
                  variant="h6"
                >
                  <label>Nome:</label>
                  <input
                    type="text"
                    name="nome"
                    style={{
                      textTransform: "capitalize",
                      border: "1px #f16d2f solid",
                      borderRadius: "8px",
                      paddingLeft: ".5rem",
                      fontFamily: "Roboto",
                      fontWeight: "500",
                      marginLeft: ".5rem",
                    }}
                    {...register("nome")}
                  />
                </Typography>
                <p>{errors.nome?.message}</p>
                <Typography
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                  }}
                  variant="h6"
                >
                  <label>Telefone:</label>
                  <InputMask
                    mask="99 9 99999999"
                    maskChar={null}
                    style={{
                      textTransform: "capitalize",
                      border: "1px #f16d2f solid",
                      borderRadius: "8px",
                      paddingLeft: ".5rem",
                      fontFamily: "Roboto",
                      fontWeight: "500",
                      marginLeft: ".5rem",
                    }}
                    {...register("telefone")}
                  />
                </Typography>
                <p>{errors.telefone?.message}</p>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              width: " 100%",
              height: " 9rem",
              position: " relative",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "100%",
                width: "100%",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  width: "13rem",
                  height: "2rem",
                  background: "rgba(0, 0, 0, 0.87)",
                  borderRadius: "0 30px 0px 0px",
                }}
              ></Box>
              <Typography variant="h6" className="editInformation">
                Forma de Entrega
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  height: "100%",
                  width: "100%",
                  justifyContent: "center",
                  color: " #0f0f0f",
                }}
              >
                <Box display={"flex"} width={"100%"} alignItems={"center"}>
                  <Controller
                    name="formaDeEntrega"
                    control={control}
                    render={({ field }) => (
                      <Box
                        sx={{
                          display: "flex",
                          width: "100%",
                          height: " 100%",
                        }}
                      >
                        <Box
                          sx={{
                            pl: 2,
                            display: "flex",
                            height: "100%",
                            width: "100%",
                            flexDirection: "column",
                            justifyContent: "space-around",
                          }}
                        >
                          <label>
                            <Typography
                              variant="h6"
                              sx={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                              }}
                            >
                              <input
                                type="radio"
                                {...field}
                                value="Entrega"
                                style={{
                                  width: " 1.2rem",
                                  height: "1.2rem",
                                }}
                              />
                              <DeliveryDiningOutlinedIcon />
                              Entrega
                            </Typography>
                          </label>

                          <label>
                            <Typography
                              variant="h6"
                              sx={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                              }}
                            >
                              <input
                                type="radio"
                                {...field}
                                value="Retirada"
                                style={{
                                  width: " 1.2rem",
                                  height: "1.2rem",
                                }}
                              />
                              <StorefrontOutlinedIcon />
                              Retirar no local
                            </Typography>
                          </label>
                          <p>{errors.formaDeEntrega?.message}</p>
                        </Box>
                      </Box>
                    )}
                  />
                </Box>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: "40rem",
              minHeight: "32rem",
            }}
          >
            <Box className="contentDeliveryAddress">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  position: " absolute",
                  top: "0.6rem",
                  width: "14rem",
                  height: "2.28rem",
                  background: "rgba(0, 0, 0, 0.87)",
                  borderRadius: " 0 30px 0px 0px",
                }}
              ></Box>
              <Typography
                variant="h6"
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  paddingLeft: " 5%",
                  paddingRight: "5%",
                  alignItems: "flex-end",
                  width: "100%",
                  height: "0.9rem",
                  color: "#f9e9df",
                  borderBottom: " 1px #0a0a0a solid",
                  zIndex: "1",
                }}
              >
                Entregar no Endereço
              </Typography>
              <Box className="addressData">
                <Typography
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: " wrap",
                  }}
                  variant="h6"
                >
                  <label>Cep:</label>
                  <InputMask
                    mask="99999-999"
                    maskChar={null}
                    {...register("cep")}
                    style={{
                      textTransform: "capitalize",
                      border: "1px #f16d2f solid",
                      borderRadius: "8px",
                      paddingLeft: ".5rem",
                      fontFamily: "Roboto",
                      fontWeight: "500",
                      marginLeft: ".5rem",
                    }}
                    onBlur={checkCEP}
                    name="cep"
                  />

                  <p>{errors.cep?.message}</p>
                </Typography>

                <Typography
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: " wrap",
                  }}
                  variant="h6"
                >
                  <label>Rua/ Av :</label>
                  <input
                    style={{
                      textTransform: "capitalize",
                      border: "1px #f16d2f solid",
                      borderRadius: "8px",
                      paddingLeft: ".5rem",
                      fontFamily: "Roboto",
                      fontWeight: "500",
                      marginLeft: ".5rem",
                    }}
                    {...register("rua")}
                    name="rua"
                  />
                  {errors.rua?.message && !getValues("rua") && (
                    <p>{errors.rua?.message}</p>
                  )}
                </Typography>
                <Typography
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: " wrap",
                  }}
                  variant="h6"
                >
                  <label>Numero:</label>
                  <input
                    style={{
                      textTransform: "capitalize",
                      border: "1px #f16d2f solid",
                      borderRadius: "8px",
                      paddingLeft: ".5rem",
                      fontFamily: "Roboto",
                      fontWeight: "500",
                      marginLeft: ".5rem",
                    }}
                    spellCheck="false"
                    name="Numero"
                    {...register("casaApto")}
                  />
                  <p>{errors.casaApto?.message}</p>
                </Typography>
                <Typography
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: " wrap",
                  }}
                  variant="h6"
                >
                  <label>Complemento :</label>
                  <input
                    style={{
                      textTransform: "capitalize",
                      border: "1px #f16d2f solid",
                      borderRadius: "8px",
                      paddingLeft: ".5rem",
                      fontFamily: "Roboto",
                      fontWeight: "500",
                      marginLeft: ".5rem",
                      maxWidth: "50%",
                    }}
                    {...register("complemento")}
                  />
                  <p>{errors.complemento?.message}</p>
                </Typography>

                <Typography
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: " wrap",
                  }}
                  variant="h6"
                >
                  <label> Bairro:</label>
                  <input
                    style={{
                      textTransform: "capitalize",
                      border: "1px #f16d2f solid",
                      borderRadius: "8px",
                      paddingLeft: ".5rem",
                      fontFamily: "Roboto",
                      fontWeight: "500",
                      marginLeft: ".5rem",
                    }}
                    spellCheck="false"
                    name="Bairro"
                    {...register("bairro")}
                  />
                  <p>{errors.bairro?.message}</p>
                </Typography>

                <Typography
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: " wrap",
                  }}
                  variant="h6"
                >
                  <label>Cidade:</label>
                  <input
                    style={{
                      textTransform: "capitalize",
                      border: "1px #f16d2f solid",
                      borderRadius: "8px",
                      paddingLeft: ".5rem",
                      fontFamily: "Roboto",
                      fontWeight: "500",
                      marginLeft: ".5rem",
                    }}
                    spellCheck="false"
                    name="Cidade"
                    {...register("cidade")}
                  />
                  <p>{errors.cidade?.message}</p>
                </Typography>

                <Typography
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: " wrap",
                  }}
                  variant="h6"
                >
                  <label>Estado:</label>
                  <input
                    style={{
                      textTransform: "capitalize",
                      border: "1px #f16d2f solid",
                      borderRadius: "8px",
                      paddingLeft: ".5rem",
                      fontFamily: "Roboto",
                      fontWeight: "500",
                      marginLeft: ".5rem",
                    }}
                    spellCheck="false"
                    name="Estado"
                    {...register("estado")}
                  />
                  <p>{errors.estado?.message}</p>
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box className="cardFormOfPayment">
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-evenly",
                height: "100%",
                width: "100%",
              }}
            >
              <Box
                sx={{
                  position: " absolute",
                  top: "0",
                  width: " 15rem",
                  height: "2.08rem",
                  background: "rgba(0, 0, 0, 0.87)",
                  borderRadius: "0 30px 0px 0px",
                  zIndex: "1",
                }}
              ></Box>
              <Typography variant="h6" className="editInformation">
                Forma de Pagamento
              </Typography>
              <Box
                sx={{
                  display: " flex",
                  flexDirection: "column",
                  height: "100%",
                  width: " 100%",
                  justifyContent: "space-around",
                  color: " #070707",
                }}
              >
                <Controller
                  name="formaDePagamento"
                  control={control}
                  render={({ field }) => (
                    <Box
                      sx={{
                        display: "flex",
                        width: "100%",
                        height: " 100%",
                      }}
                    >
                      <Box
                        sx={{
                          pl: 2,
                          display: "flex",
                          height: "100%",
                          width: "100%",
                          flexDirection: "column",
                          justifyContent: "space-around",
                        }}
                      >
                        <label>
                          <Typography
                            variant="h6"
                            sx={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <input
                              type="radio"
                              {...field}
                              value="Credito"
                              style={{
                                width: " 1.2rem",
                                height: "1.2rem",
                              }}
                              onChange={() => {
                                field.onChange("Credito");
                                setIsModalOpen(false);
                              }}
                            />
                            <CreditCardOutlinedIcon />
                            Cartão de Crédito
                          </Typography>
                        </label>

                        <label>
                          <Typography
                            variant="h6"
                            sx={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <input
                              type="radio"
                              {...field}
                              value="Debito"
                              style={{
                                width: " 1.2rem",
                                height: "1.2rem",
                              }}
                              onChange={() => {
                                field.onChange("Debito");
                                setIsModalOpen(false);
                              }}
                            />
                            <CreditCardOutlinedIcon />
                            Cartão de Débito
                          </Typography>
                        </label>

                        <label>
                          <Typography
                            variant="h6"
                            sx={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <input
                              type="radio"
                              {...field}
                              value="Pix"
                              style={{
                                width: " 1.2rem",
                                height: "1.2rem",
                              }}
                              onChange={() => {
                                field.onChange("Pix");
                                setIsModalOpen(false);
                              }}
                            />
                            <PixOutlinedIcon />
                            Pix
                          </Typography>
                        </label>

                        <label>
                          <Typography
                            variant="h6"
                            sx={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <input
                              type="radio"
                              {...field}
                              value="Dinheiro"
                              style={{
                                width: " 1.2rem",
                                height: "1.2rem",
                              }}
                              onChange={() => {
                                field.onChange("Dinheiro");
                                setIsModalOpen(true);
                              }}
                            />
                            <AttachMoneyIcon />
                            Dinheiro
                          </Typography>
                        </label>
                      </Box>
                    </Box>
                  )}
                />
                <Box>
                  <p>{errors.formaDePagamento?.message}</p>
                </Box>
              </Box>
            </Box>
          </Box>

          <Modal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            aria-labelledby="confirmation-modal-title"
            aria-describedby="confirmation-modal-description"
          >
            <Box
              sx={{
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-evenly",
                backgroundColor: "#fae9de",
                position: " absolute",
                top: " 50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: " 90%",
                maxWidth: "600px",
                height: "15rem",
                minHeight: " 100px",
                border: "6px solid #e5c7b3",
                borderRadius: " 30px",
                boxShadow: "5px 4px 5px 2px rgba(0, 0, 0, 0.2)",
              }}
            >
              <Typography variant="h6" id="confirmation-modal-title">
                Sua compra deu: {useFormat(calculateSubtotal(cart))}
              </Typography>
              {isChangeNeeded ? (
                <>
                  <Typography
                    sx={{
                      height: "auto",
                    }}
                    variant="body2"
                    gutterBottom
                  >
                    Troco para
                  </Typography>
                  <InputMask
                    className="box-shadow"
                    mask="R$ 999"
                    maskChar={null}
                    style={{
                      border: "1px #f46c26 solid",
                      height: "2rem",
                      borderRadius: "5px",
                      paddingLeft: "1rem",
                    }}
                    label="Valor do Troco"
                    value={changeAmount}
                    onChange={(e) => setChangeAmount(e.target.value)}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-evenly",
                      flexDirection: "row-reverse",
                      width: "100%",
                    }}
                  >
                    <button
                      className="click box-shadow"
                      style={{
                        textTransform: "uppercase",
                        backgroundColor: "#f46c26",
                        color: "white",
                        border: "1px solid #f46c26",
                        height: "2rem",
                        borderRadius: "5px",
                        fontFamily: "Roboto",
                        fontSize: "16px",
                        width: "10rem",
                      }}
                      onClick={() => handleConfirmChangeAmount()}
                    >
                      Confirmar troco
                    </button>
                    <button
                      className="click box-shadow"
                      style={{
                        textTransform: "uppercase",
                        backgroundColor: "#f46c26",
                        color: "white",
                        border: "1px solid #f46c26",
                        height: "2rem",
                        borderRadius: "5px",
                        fontFamily: "Roboto",
                        fontSize: "16px",
                        width: "5rem",
                      }}
                      onClick={() => setIsChangeNeeded(false)}
                    >
                      Voltar
                    </button>
                  </Box>
                </>
              ) : (
                <>
                  <button
                    className="click box-shadow"
                    style={{
                      textTransform: "uppercase",
                      backgroundColor: "#f46c26",
                      color: "white",
                      border: "1px solid #f46c26",
                      height: "2rem",
                      borderRadius: "5px",
                      fontFamily: "Roboto",
                      fontSize: "16px",
                      width: "12rem",
                    }}
                    onClick={() => handleConfirmChangeAmount()}
                  >
                    Não preciso de troco
                  </button>
                  <button
                    className="click box-shadow"
                    style={{
                      textTransform: "uppercase",
                      backgroundColor: "#f46c26",
                      color: "white",
                      border: "1px solid #f46c26",
                      height: "2rem",
                      borderRadius: "5px",
                      fontFamily: "Roboto",
                      fontSize: "16px",
                      width: "10rem",
                    }}
                    onClick={() => setIsChangeNeeded(true)}
                  >
                    Preciso de troco
                  </button>
                </>
              )}
            </Box>
          </Modal>

          <Box className="totalPurchase">
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "75%",
                height: "100%",
                alignItems: "left",
                justifyContent: "center",
                pl: 1,
                color: "#f9e9df",
              }}
            >
              <Typography variant="h6">
                Total:{useFormat(calculateSubtotal(cart))}
              </Typography>
            </Box>
            <input
              className="btnSendRequest click"
              type="submit"
              value="Enviar"
              onClick={() => {
                 
                onSubmit(); 
              }}
            />
          </Box>
        </Box>
      </form>
    </Box>
  );
};

export default Order;
