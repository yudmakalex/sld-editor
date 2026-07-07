<?xml version="1.0" encoding="UTF-8"?>
<SCL xmlns="http://www.iec.ch/61850/2003/SCL" version="Edition2.1" revision="2020">
  <!-- Sample substation for SLD rendering -->
  <Substation name="SUB1" desc="Demo Substation">
    <VoltageLevel name="VL1" voltage="110" desc="110 kV Level">
      <Bay name="BAY1" desc="Incoming Feeder">
        <ConductingEquipment name="Q01" type="CBR" pathName="SUB1/VL1/BAY1/Q01" desc="Incomer CB">
          <LNode iedName="RELAY1" lnClass="XCBR" lnInst="1" doName="Pos"/>
        </ConductingEquipment>
        <ConductingEquipment name="Q02" type="DIS" pathName="SUB1/VL1/BAY1/Q02" desc="Bus Disconnector">
          <LNode iedName="RELAY1" lnClass="XSWI" lnInst="1" doName="Pos"/>
        </ConductingEquipment>
        <ConductingEquipment name="CT1" type="CTR" pathName="SUB1/VL1/BAY1/CT1" desc="Line CT"/>
        <ConnectivityNode name="N1" pathName="SUB1/VL1/BAY1/N1" desc="Bus Node"/>
      </Bay>
      <Bay name="BAY2" desc="Transformer Feeder">
        <ConductingEquipment name="T1" type="TFL" pathName="SUB1/VL1/BAY2/T1" desc="Power Transformer 110/10kV"/>
        <ConductingEquipment name="Q03" type="CBR" pathName="SUB1/VL1/BAY2/Q03" desc="LV Side CB"/>
        <ConductingEquipment name="VT1" type="VTR" pathName="SUB1/VL1/BAY2/VT1" desc="Bus VT"/>
        <ConnectivityNode name="N2" pathName="SUB1/VL1/BAY2/N2" desc="Transformer Node"/>
      </Bay>
    </VoltageLevel>
    <VoltageLevel name="VL2" voltage="10" desc="10 kV Level">
      <Bay name="BAY3" desc="Feeder 1">
        <ConductingEquipment name="Q04" type="CBR" pathName="SUB1/VL2/BAY3/Q04" desc="Feeder CB 1">
          <LNode iedName="RELAY2" lnClass="XCBR" lnInst="1" doName="Pos"/>
        </ConductingEquipment>
        <ConductingEquipment name="M1" type="MOT" pathName="SUB1/VL2/BAY3/M1" desc="Motor Load 1"/>
        <ConnectivityNode name="N3" pathName="SUB1/VL2/BAY3/N3" desc="10kV Bus"/>
      </Bay>
      <Bay name="BAY4" desc="Feeder 2">
        <ConductingEquipment name="Q05" type="CBR" pathName="SUB1/VL2/BAY4/Q05" desc="Feeder CB 2"/>
        <ConductingEquipment name="C1" type="CAP" pathName="SUB1/VL2/BAY4/C1" desc="Capacitor Bank"/>
        <ConnectivityNode name="N4" pathName="SUB1/VL2/BAY4/N4" desc="10kV Bus 2"/>
      </Bay>
    </VoltageLevel>
  </Substation>

  <IED name="RELAY1" type="REF615" manufacturer="ABB" desc="Bay Protection Relay 1">
    <AccessPoint name="AP1">
      <Server>
        <LDevice inst="LD0" desc="Protection">
          <LN0 lnClass="LLN0" inst="" desc="Logical Node Zero"/>
          <LN lnClass="XCBR" inst="1" desc="Breaker 1">
            <DOI name="Pos" fc="ST">
              <DAI name="stVal"><Val>1</Val></DAI>
              <DAI name="q"><Val>Good</Val></DAI>
            </DOI>
            <DOI name="OpCnt" fc="ST">
              <DAI name="stVal"><Val>0</Val></DAI>
            </DOI>
          </LN>
          <LN lnClass="XSWI" inst="1" desc="Switch 1">
            <DOI name="Pos" fc="ST">
              <DAI name="stVal"><Val>0</Val></DAI>
            </DOI>
          </LN>
          <LN lnClass="MMXU" inst="1" desc="Measurement">
            <DOI name="PhsA" fc="MX">
              <DAI name="cVal"><Val>125.3</Val></DAI>
            </DOI>
            <DOI name="PhsB" fc="MX">
              <DAI name="cVal"><Val>124.8</Val></DAI>
            </DOI>
            <DOI name="W" fc="MX">
              <DAI name="mag"><Val>45.2</Val></DAI>
            </DOI>
          </LN>
          <LN lnClass="CSWI" inst="1" desc="Control">
            <DOI name="Pos" fc="CO">
              <DAI name="ctlVal"><Val>0</Val></DAI>
            </DOI>
          </LN>
        </LDevice>
      </Server>
    </AccessPoint>
  </IED>

  <IED name="RELAY2" type="REF615" manufacturer="ABB" desc="Feeder Protection Relay">
    <AccessPoint name="AP1">
      <Server>
        <LDevice inst="LD0" desc="Protection">
          <LN0 lnClass="LLN0" inst="" desc="Logical Node Zero"/>
          <LN lnClass="XCBR" inst="1" desc="Feeder Breaker">
            <DOI name="Pos" fc="ST">
              <DAI name="stVal"><Val>1</Val></DAI>
            </DOI>
          </LN>
          <LN lnClass="MMXU" inst="1" desc="Measurement">
            <DOI name="PhsA" fc="MX">
              <DAI name="cVal"><Val>8.2</Val></DAI>
            </DOI>
          </LN>
        </LDevice>
      </Server>
    </AccessPoint>
  </IED>

  <IED name="SCADA_Main" type="SCADA" manufacturer="SLD-Editor" desc="SCADA Client IED">
    <AccessPoint name="AP1">
      <Server>
        <LDevice inst="LD0" desc="SCADA">
          <LN0 lnClass="IHMIO" inst="" desc="SCADA Client"/>
          <LN lnClass="IHMIO" inst="1" desc="Bay 1 View"/>
          <LN lnClass="IHMIO" inst="2" desc="Bay 2 View"/>
        </LDevice>
      </Server>
    </AccessPoint>
  </IED>

  <Communication>
    <Subnetwork name="SUBNET1" type="8-MMS">
      <ConnectedAP iedName="RELAY1" apName="AP1">
        <Address>
          <P type="IP">192.168.1.10</P>
          <P type="OSI-TP">102</P>
        </Address>
      </ConnectedAP>
      <ConnectedAP iedName="RELAY2" apName="AP1">
        <Address>
          <P type="IP">192.168.1.11</P>
          <P type="OSI-TP">102</P>
        </Address>
      </ConnectedAP>
      <ConnectedAP iedName="SCADA_Main" apName="AP1">
        <Address>
          <P type="IP">192.168.1.100</P>
          <P type="OSI-TP">102</P>
        </Address>
      </ConnectedAP>
    </Subnetwork>
  </Communication>
</SCL>
