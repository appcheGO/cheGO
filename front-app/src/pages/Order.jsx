import {
  Box,
  FormControlLabel,
  Modal,
  Radio,
  RadioGroup,
  Typography,
  capitalize,
} from "@mui/material";
import { useState } from "react";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeliveryDiningOutlinedIcon from "@mui/icons-material/DeliveryDiningOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import PixOutlinedIcon from "@mui/icons-material/PixOutlined";
import { NavLink } from "react-router-dom";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import InputMask from "react-input-mask";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useCarrinho } from "../context/useCarrinho";
import { useFormat } from "../utils/useFormat";

import "./Order.css";

const Order = () => {
  const [isEntrega, setIsEntrega] = useState(undefined);

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

  const SignupSchema = yup
    .object()
    .shape({
      estado: isEntrega
        ? yup.string().required(campoObrigatorio)
        : yup.string(),
      cidade: isEntrega
        ? yup.string().required(campoObrigatorio)
        : yup.string(),
      bairro: isEntrega
        ? yup.string().required(campoObrigatorio)
        : yup.string(),
      casaApto: isEntrega
        ? yup.string().required(campoObrigatorio)
        : yup.string(),
      rua: isEntrega ? yup.string().required(campoObrigatorio) : yup.string(),
      cep: isEntrega ? yup.string().required(campoObrigatorio) : yup.string(),
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
        return isEntrega
          ? yup
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
              .validate(obj)
          : yup.object().validate(obj);
      } else if (obj.formaDeEntrega === "Retirada") {
        return yup.object().validate(obj);
      }
    });
  const { sendOrder, saveUserData, cart, calculateSubtotal } = useCarrinho();
  const [changeAmount, setChangeAmount] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChangeNeeded, setIsChangeNeeded] = useState(false);
  const handleConfirmChangeAmount = () => {
    const confirmedChangeAmount = changeAmount;
    setIsModalOpen(false);
    console.log(confirmedChangeAmount);
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    setFocus,
    control,
  } = useForm({
    resolver: yupResolver(SignupSchema),
  });

  const [numberPhone, setNumberPhone] = useState("");

  const handleFormSubmit = async (data) => {
    const totalValue = calculateSubtotal(cart);

    if (totalValue === 0) {
      alert(
        "Carrinho vazio. Adicione itens ao carrinho antes de enviar o pedido."
      );
    } else {
      if (isValid) {
        try {
          const userId = await saveUserData(data);

          createWhatsAppMessage(data);

          await sendOrder(data, userId);
          handleOpen();
        } catch (error) {
          console.error("Erro ao salvar os dados:", error);
        }
      } else {
        console.log("Form has errors:", errors);
      }
    }
  };

  const handleOpen = () => {
    if (isValid) {
      setOpen(true);
    } else {
      console.log("Form is not valid");
    }
  };
  const handleCloseModal = () => {
    setIsChangeNeeded(false); // Fechar o modal
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

  const removeError = (field) => {
    if (errors[field]) {
      errors[field] = undefined;
    }
  };

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
        if (item.opcionalSelecionado) {
          message += `Opcional: ${item.opcionalSelecionado}\n`;
        }
        const ingredientes = item.ingredientes;
        if (ingredientes.includes("Gelada")) {
          console.log("e bebida entao valor de opcional  nao entra");
        } else {
          if (
            (item.opcionalSelecionado && item.valorOpcional === undefined) ||
            (item.opcionalSelecionado && item.valorOpcional === "") ||
            (item.opcionalSelecionado && item.valorOpcional === 0) ||
            item.opcionais === 0
          ) {
            message += `Valor do opcional: Grátis\n`;
            console.log(item.valorOpcional);
          } else {
            message += `Valor do opcional: R$ ${item.valorOpcional}\n`;
          }
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
        if (
          item.valorTotalDoProduto === undefined ||
          item.valorTotalDoProduto === null
        ) {
          message += `Valor total do item: R$ ${item.valor.toFixed(2)}\n`;
        } else {
          message += `Valor total do item: R$ ${item.valorTotalDoProduto.toFixed(
            2
          )}\n`;
        }

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
        if (item.opcionalSelecionado) {
          message += `Opcional: ${item.opcionalSelecionado}\n`;
        }
        const ingredientes = item.ingredientes;
        if (ingredientes.includes("Gelada")) {
          console.log("e bebida entao valor de opcional  nao entra");
        } else {
          if (
            (item.opcionalSelecionado && item.valorOpcional === undefined) ||
            (item.opcionalSelecionado && item.valorOpcional === "") ||
            (item.opcionalSelecionado && item.valorOpcional === 0) ||
            item.opcionais === 0
          ) {
            message += `Valor do opcional: Grátis\n`;
            console.log(item.valorOpcional);
          } else {
            message += `Valor do opcional: R$ ${item.valorOpcional}\n`;
          }
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
        if (
          item.valorTotalDoProduto === undefined ||
          item.valorTotalDoProduto === null
        ) {
          message += `Valor total do item: R$ ${item.valor.toFixed(2)}\n`;
        } else {
          message += `Valor total do item: R$ ${item.valorTotalDoProduto.toFixed(
            2
          )}\n`;
        }

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
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Box className="headerOrder">
          <Box className="iconAndText">
            <NavLink to="/" style={{ color: "#f9e9df" }}>
              <ArrowBackIcon />
            </NavLink>
            <Typography variant="h6">Checkout</Typography>
          </Box>
        </Box>
        <Box className="contentOrder">
          <Box className="cardPersonalData">
            <Box className="contentPersonalData">
              <Box
                sx={{
                  position: "absolute",
                  top: "0",
                  width: "13rem",
                  height: "2rem",
                  background: "rgba(0, 0, 0, 0.87)",
                  borderRadius: "0 30px 0px 0px",
                }}
              ></Box>
              <Typography
                variant="h6"
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingLeft: "5%",
                  paddingRight: "5%",
                  alignItems: "center",
                  width: "100%",
                  color: " #f9e9df",
                  borderBottom: "1px #070707 solid",
                  zIndex: "1",
                }}
              >
                Dados pessoais
              </Typography>
              <Box className="nameAndTelephone">
                <>
                  <Typography
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      flexWrap: "wrap",
                    }}
                    variant="h6"
                  >
                    <label>Telefone:</label>
                    <InputMask
                      style={{
                        textTransform: "capitalize",
                        border: "1px #f16d2f solid",
                        borderRadius: "8px",
                        paddingLeft: ".5rem",
                        fontFamily: "Roboto",
                        fontWeight: "500",
                        marginLeft: ".5rem",
                      }}
                      mask="99 9 99999999"
                      placeholder="exemplo: 99 9 99999999"
                      maskChar={null}
                      value={numberPhone}
                      {...register("telefone")}
                      onInput={() => removeError("telefone")}
                      onChange={(e) => {
                        setNumberPhone(e.target.value);
                      }}
                    />
                  </Typography>
                  {errors.telefone && (
                    <p className="error-message">{errors.telefone.message}</p>
                  )}
                  <Typography
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      flexWrap: "wrap",
                    }}
                    variant="h6"
                  >
                    <label>Nome: </label>
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
                      onInput={() => removeError("nome")}
                      type="text"
                      {...register("nome")}
                    />
                  </Typography>
                  {errors.nome && (
                    <p className="error-message">{errors.nome.message}</p>
                  )}
                </>
              </Box>
            </Box>
          </Box>

          <Box className="cardDeliveryMethod">
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
                  top: "0",
                  width: "13rem",
                  height: "2.1rem",
                  background: "rgba(0, 0, 0, 0.87)",
                  borderRadius: "0 30px 0px 0px",
                }}
              ></Box>
              <Typography
                variant="h6"
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingLeft: "5%",
                  paddingRight: "5%",
                  alignItems: "center",
                  width: "100%",
                  color: " #f9e9df",
                  borderBottom: "1px #070707 solid",
                  zIndex: "1",
                }}
              >
                Forma de Entrega
              </Typography>

              <RadioGroup
                sx={{ paddingLeft: "1.2rem" }}
                name="formaDeEntrega"
                value={isEntrega} // Define o valor com base no estado isEntrega
                onChange={(e) => setIsEntrega(e.target.value === "Entrega")}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <FormControlLabel
                    value="Entrega"
                    name="Entrega"
                    {...register("formaDeEntrega")}
                    control={<Radio />}
                    label={
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <DeliveryDiningOutlinedIcon />
                        <Typography variant="h6" sx={{ pl: 2 }}>
                          Entrega
                        </Typography>
                      </Box>
                    }
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <FormControlLabel
                    value="Retirada"
                    name="Retirada"
                    {...register("formaDeEntrega")}
                    control={<Radio />}
                    label={
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <StorefrontOutlinedIcon />
                        <Typography variant="h6" sx={{ pl: 2 }}>
                          Retirar no local
                        </Typography>
                      </Box>
                    }
                  />
                </Box>
              </RadioGroup>
              {errors.formaDeEntrega && (
                <p className="error-message">{errors.formaDeEntrega.message}</p>
              )}
            </Box>
          </Box>

          <Box className="cardDeliveryAddress">
            <Box className="contentDeliveryAddress">
              <Box
                sx={{
                  position: "absolute",
                  top: "1rem",
                  width: "15rem",
                  height: "2.8rem",
                  background: "rgba(0, 0, 0, 0.87)",
                  borderRadius: "0 30px 0px 0px",
                }}
              ></Box>
              <Typography variant="h6" className="editInformationAddress">
                Entregar no Endereço
              </Typography>
              <Box className="addressData">
                <>
                  <Typography
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      flexWrap: "wrap",
                    }}
                    variant="h6"
                  >
                    <label>Cep:</label>
                    <InputMask
                      style={{
                        textTransform: "capitalize",
                        border: "1px #f16d2f solid",
                        borderRadius: "8px",
                        paddingLeft: ".5rem",
                        fontFamily: "Roboto",
                        fontWeight: "500",
                        marginLeft: ".5rem",
                      }}
                      mask="99999-999"
                      placeholder="exemplo: 99 999-999"
                      maskChar={null}
                      type="text"
                      name="cep"
                      {...register("cep")}
                      onInput={() => removeError("cep")}
                      onBlur={checkCEP}
                    />
                    {errors.cep && (
                      <p className="error-message">{errors.cep.message}</p>
                    )}
                  </Typography>

                  <Typography
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      flexWrap: "wrap",
                    }}
                    variant="h6"
                  >
                    <label>Rua / Av :</label>
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
                      type="text"
                      name="rua"
                      {...register("rua")}
                      onInput={() => removeError("rua")}
                    />
                    {errors.rua && (
                      <p className="error-message">{errors.rua.message}</p>
                    )}
                  </Typography>
                  <Typography
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      flexWrap: "wrap",
                    }}
                    variant="h6"
                  >
                    <label>Casa/Apto :</label>
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
                      type="text"
                      name="casaApto"
                      {...register("casaApto")}
                    />
                    {errors.casaApto && (
                      <p className="error-message">{errors.casaApto.message}</p>
                    )}
                  </Typography>
                  <Typography
                    sx={{ display: "flex", flexDirection: "row" }}
                    variant="h6"
                  >
                    <label>Complemento:</label>
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
                      type="text"
                      name="complemento"
                      {...register("complemento")}
                    />
                  </Typography>

                  <Typography
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      flexWrap: "wrap",
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
                      onInput={() => removeError("bairro")}
                      type="text"
                      name="bairro"
                      {...register("bairro")}
                    />
                    {errors.bairro && (
                      <p className="error-message">{errors.bairro.message}</p>
                    )}
                  </Typography>

                  <Typography
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      flexWrap: "wrap",
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
                      type="text"
                      name="cidade"
                      {...register("cidade")}
                    />
                    {errors.cidade && (
                      <p className="error-message">{errors.cidade.message}</p>
                    )}
                  </Typography>

                  <Typography
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      flexWrap: "wrap",
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
                      type="text"
                      name="estado"
                      {...register("estado")}
                    />
                    {errors.estado && (
                      <p className="error-message">{errors.estado.message}</p>
                    )}
                  </Typography>
                </>
              </Box>
            </Box>
          </Box>

          <Box className="cardFormOfPayment">
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                height: "100%",
                width: "100%",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: "1.6rem",
                  width: "15rem",
                  minHeight: "2rem",
                  background: "rgba(0, 0, 0, 0.87)",
                  borderRadius: "0 30px 0px 0px",
                  zIndex: "1",
                }}
              ></Box>
              <Typography
                variant="h6"
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingLeft: "5%",
                  paddingRight: "5%",
                  alignItems: "center",
                  width: "100%",
                  color: " #f9e9df",
                  borderBottom: "1px #070707 solid",
                  zIndex: "1",
                }}
              >
                Forma de Pagamento
              </Typography>
              <Box className="FormOfPayment">
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
                {errors.formaDePagamento && (
                  <p className="error-message">
                    {errors.formaDePagamento.message}
                  </p>
                )}
              </Box>
            </Box>
          </Box>

          <Box className="totalPurchase">
            <Box className="contentTotalPurchase">
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  width: "75%",
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  pl: 1,
                  gap: "0.2rem",
                }}
              >
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6">
                  {useFormat(calculateSubtotal(cart))}
                </Typography>
              </Box>
              <input
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontFamily: "Roboto",
                  height: "3rem",
                  minHeight: "3rem",
                  border: "1px solid #f46c26",
                  borderRadius: "10px",
                  color: "#f16d2f",
                  minWidth: "50%",
                  textDecoration: "none",
                  transition: "background-color 0.3s",
                  fontSize: "16px",
                  marginRight: "1rem",
                }}
                className="click box-shadow"
                type="submit"
                value={"Enviar pedido"}
                onClick={handleOpen}
              />
            </Box>
          </Box>
        </Box>
        <Modal
          open={isModalOpen}
          onClose={handleCloseModal}
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
      </form>
    </Box>
  );
};

export default Order;
