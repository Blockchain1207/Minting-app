import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton = styled.button`

  padding: 15px;
  border-radius: 10px;
  background-color: #5f7de8;
  width: 100%;
  font-size: 20px;
  color: #ffffff;

  cursor: pointer;

  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 100%;
  background-color: #5f7de8;
  font-size: 42px;
  color: #fff;
  width: 60px;
  height: 60px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: fixed;
  align-items: center;
  width: 100%;
  
  @media (min-width: 767px) {
    flex-direction: row;
  }
`;

export const StyledLogo = styled.img`
  width: 200px;
  @media (min-width: 767px) {
    width: 300px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledImg = styled.img`

  border-radius: 100%;
  width: 200px;
  
  @media (min-width: 900px) {
    width: 250px;
  }
  @media (min-width: 1000px) {
    width: 300px;
  }
  transition: width 0.5s;
`;

export const StyledLink = styled.a`
  color: var(--primary);
  text-decoration: none;
  font-size: 24px;
`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [giveAway, setgiveAway] = useState(false);
  const [claimingNft, setClaimingNft] = useState({one: false, two: false});
  const [feedback, setFeedback] = useState(`Click the button below to connect your Metamask wallet.`);
  const [mintAmount, setMintAmount] = useState(1);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const claimNFTs = () => {
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
    setClaimingNft({...claimingNft, one: true});
    blockchain.smartContract.methods
      .mint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft({...claimingNft, one: false});
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          <StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}
               style={{
                 textAlign: "center",
                 fontSize: 18,
                 color: "#5f7de8",
                 
               }}
               >
                 {'Congratulations , you have minted a Knight. Click to view on OpenSea.'}
               </StyledLink>
        );
        setClaimingNft({...claimingNft, one: false});
        dispatch(fetchData(blockchain.account));
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    //giveaway decrement
    if(giveAway == true){
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 2) {
      newMintAmount = 2;
    }
    //giveaway increment
    if(giveAway == true){
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const checkAddress = async () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      let whiteList = await blockchain.smartContract.methods
      .isWhitelisted(blockchain.account).call().then(result => result);

      let giveAwayBool = await blockchain.smartContract.methods
      .giveawayList(blockchain.account).call().then(result => result);

      let onlyWhitelisted = await blockchain.smartContract.methods
      .onlyWhitelisted().call().then(result => result);

      let feeback_char;

      if(onlyWhitelisted){
        if(giveAwayBool){
          setgiveAway(true);
          SET_CONFIG({...CONFIG, WEI_COST: 0, DISPLAY_COST: 0 });
          feeback_char = "Congratulations, you have been selected for our Giveaway. Please note you can only MINT AFTER THE PRESALE period is over.";
          setClaimingNft({...claimingNft, two: true});
        }else if(whiteList){
          setgiveAway(false);
          getConfig();
          feeback_char = "Congratulations, You have been approved for our WHITELIST  Mint your Knight now.";
          setClaimingNft({...claimingNft, two: false});
        }else{
          setgiveAway(false);
          getConfig();
          feeback_char = "Our Presale is still on - you are not whitelisted for this period. Please check back later.";
          setClaimingNft({...claimingNft, two: true});
        }
      }else{
        
        if(giveAwayBool){
          setgiveAway(true);
          SET_CONFIG({...CONFIG, WEI_COST: 0, DISPLAY_COST: 0 });
          feeback_char = "Congratulations, you have won a Giveaway. Click to Mint your NFT";
          setClaimingNft({...claimingNft, two: false});
        }
        else{
          setgiveAway(false);
          getConfig();
          feeback_char = "Click below to mint your NFT.";
          setClaimingNft({...claimingNft, two: false});
        }
      }

      setFeedback(feeback_char);
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
    checkAddress();
  }, [blockchain.account]);

  return (
    <s.Screen>
      <s.Container
        flex={1}
        ai={"center"}
        style={{ padding: 24, backgroundColor: "var(--primary)" }}
        image={CONFIG.SHOW_BACKGROUND ? "/config/images/bg.png" : null}
      >
        <StyledLogo alt={"logo"} src={"/config/images/logo.png"} />
        <s.SpacerSmall />
        <ResponsiveWrapper flex={1} style={{ padding: 24 }} test>
          <s.Container flex={1} jc={"center"} ai={"center"}>
            <StyledImg alt={"example"} src={"/config/images/example.gif"} />
          </s.Container>
          <s.SpacerLarge />
          <s.Container
            flex={2}
            jc={"center"}
            ai={"center"}
            style={{
              backgroundColor: "#FFF",
              padding: 24,
              borderRadius: 10,
              opacity: 0.9,

            }}
          >
            <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 36,
               // fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
               Minting has started
            </s.TextTitle>
           
            <s.SpacerSmall />
            <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "#5f7de8",
                        fontWeight:"bold",
                        fontSize: 24,
                      }}
                    >
                      {feedback}
                    </s.TextDescription>
            
   

            {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  All our Knights have been claimed.
                </s.TextTitle>
                <s.TextDescription
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  You can still get one on
                </s.TextDescription>
                <s.SpacerSmall />
                <StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
                  "{CONFIG.MARKETPLACE}"
                </StyledLink>
              </>
            ) : (
              <>
              <s.SpacerSmall />
                <s.TextTitle //price
                  style={{ textAlign: "center", fontWeight: "bold", fontSize:24, color: "var(--accent-text)" }}
                >
                  1 {CONFIG.SYMBOL} costs 0.1{" "}
                  {CONFIG.NETWORK.SYMBOL}
                </s.TextTitle>
                
                <s.TextDescription
                  style={{ textAlign: "center", fontSize:14, color: "#555" }}
                >
                  (excluding gas fees)
                </s.TextDescription>

                <s.SpacerXSmall />
                <s.TextDescription
                  style={{ textAlign: "center", fontSize:16,  color: "var(--accent-text)" }}
                >                  
                  We currently have a limit of 2 NFTs per wallet for whitelist mints.
                </s.TextDescription>

                      

                {blockchain.account === "" ||
                blockchain.smartContract === null ? (
                  <s.Container ai={"center"} jc={"center"}>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      Connect to the {CONFIG.NETWORK.NAME} network
                    </s.TextDescription>
                    <s.SpacerSmall />
                    <StyledButton
                      onClick={(e) => {
                        e.preventDefault();
                        dispatch(connect());
                        getData();
                      }}
                    >
                      Click to Connect Metamask
                    </StyledButton>
                    {blockchain.errorMsg !== "" ? (
                      <>
                        <s.SpacerSmall />
                        <s.TextDescription
                          style={{
                            textAlign: "center",
                            color: "var(--accent-text)",
                          }}
                        >
                          {blockchain.errorMsg}
                        </s.TextDescription>
                      </>
                    ) : null}
                  </s.Container>
                ) : (
                  <>

                    <s.SpacerMedium />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledRoundButton
                        style={{ lineHeight: 0.4 }}
                        disabled={claimingNft.one ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          decrementMintAmount();
                        }}
                      >
                        -
                      </StyledRoundButton>
                      <s.SpacerMedium />
                      <s.TextDescription
                        style={{
                          textAlign: "center",
                          color: "var(--accent-text)",
                          fontSize: "24px",
                        }}
                      >
                        {mintAmount}
                      </s.TextDescription>
                      <s.SpacerMedium />
                      <StyledRoundButton
                        disabled={claimingNft.one ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          incrementMintAmount();
                        }}
                      >
                        +
                      </StyledRoundButton>
                    </s.Container>
                    <s.SpacerSmall />

                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledButton
                        disabled={claimingNft.one || claimingNft.two ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          claimNFTs();
                          getData(); 
                        }} 
                      > 
                        {claimingNft.one ? "Minting...Please wait." : "Click here to MINT your Knight"}
                      </StyledButton> 
                      
                    </s.Container>
                    <s.SpacerSmall />
                    <s.TextDescription>
                        <StyledLink target={"_blank"} href={CONFIG.SCAN_LINK}
                          style={{
                          textAlign: "center",
                          fontSize: 14,
                          color: "#555",
                          }}
                          >
                          {'View Contract on Etherscan'}
                        </StyledLink>
                      </s.TextDescription>
                      <s.TextDescription>
               
               <StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}
               style={{
                 textAlign: "center",
                 fontSize: 14,
                 color: "#555",
                 
               }}
               >
                 {'View Collection on OpenSea'}
               </StyledLink>

             </s.TextDescription>
                  </>
                )}
              </>
            )}
            <s.SpacerMedium />
          </s.Container>
          
          <s.SpacerLarge />
          <s.Container flex={1} jc={"center"} ai={"center"}>
            <StyledImg
              alt={"example"}
              src={"/config/images/example2.gif"}
              style={{ transform: "scaleX(-1)" }}
            />
          </s.Container>
          
        </ResponsiveWrapper>
        <s.SpacerMedium />
        <s.Container jc={"center"} ai={"center"} style={{ width: "70%" }}>
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "#888",
            }}
          >
            Please make sure you are connected to the right network (
            Ethereum Mainnet) using Metamask. Please note:
            Once you make the purchase, you cannot undo this action.
          </s.TextDescription>
          <s.SpacerSmall />
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "#",
              
            }}
          >
          </s.TextDescription>
        </s.Container>
      </s.Container>
    </s.Screen>
  );
}

export default App;
