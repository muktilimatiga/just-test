import { FieldWrapper } from '';
import { z } from '@zod';

export const DefaultFormConfigSchema = z.object({
  olt_name: str;
  modem_type: str;
  package: string;  
  onu_sn: string;
  name: string;
  address: string;
  user_pppoe: string;
  pass_pppoe: string;
  eth_lock: str;
})

export const ConfigManualSchema = DefaultFormConfigSchema.extend({
  query: str;
})

export const ConfigAutoSchema = DefaultFormConfigSchema.extend({
  dataPSB: str;
})

export const ConfigBatchSchema = DefaultFormConfigSchema.pick({
  onu_sn: str;
})

export const ConfigBridgeSchema = DefaultFormconfigSchema.extend({
  vlan: number;
})


export type DefaultFormConfig = z.inter<typeof DefaultConfigSchema>;
export type ConfigFormBridge = z.inter<typeof ConfigBridgeSchema>;
export type ConfigFormManual = z.inter<typeof ConfigFormManualSchema>;
export type ConfigFromAuto = z.inter<typeof ConfigFormAutoSchema>;
export type ConfigFormBatch = z.inter<typeof ConfigBatchSchema>;


export function ConfigFormManual() {
  return (
    <div className="form-content-grid-3">
      <FieldWrapper
        name="olt_name" label"Select OLT" components="Select"
        items={[
            { value='', label='' },
        ]}/>
        <FieldWrapper 
          name="" label="" components=""
          items={[
            { value='', label=''},
          ]}/>
        <FieldWrapper
          name="package" label="Paket" compoents="Select"
          items={[
              { value='', label=''},
          ]}/>
      </div>
      <FieldWrapper name="onu_sn" label="SN" components="Select"
      items{[
        {};
      ]}/>
      <FieldWrapper name="query" label "Search" commponets="Input">
      <FieldWrapper name="name" label="Nama" components="Input">
      <FieldWrapper name="address" label="Alamat" components="Select"
    <div classname="form-content-grid-2">
        <FieldWrapper name="user_pppoe" label="PPPoE" components="Input"/>
        <FieldWrapper name="pass_pppoe" label="Pass PPPoE" components="Input"/>
    </div>
    <FieldWrapper name="eth_lock" label="Eth Locks?" components="Checkbox">
  )
};

export function ConfigFromAuto() {
  return (
        <div className="form-content-grid-3">
        <FieldWrapper
          name="olt_name" label"Select OLT" components="Select"
        items={[
            { value='', label='' },
        ]}/>
        <FieldWrapper 
          name="" label="" components=""
          items={[
            { value='', label=''},
          ]}/>
        <FieldWrapper
          name="package" label="Paket" compoents="Select"
          items={[
              { value='', label=''},
          ]}/>
      </div>
      <FieldWrapper name="onu_sn" label="SN" components="Select"
      items{[
        {};
      ]}/>
      <FieldWrapper name="data_psb" label "Select Customer" commponets="Select"
      items={[
        {};
      ]}>
      <FieldWrapper name="name" label="Nama" components="Input">
      <FieldWrapper name="address" label="Alamat" components="Select"
    <div classname="form-content-grid-2">
        <FieldWrapper name="user_pppoe" label="PPPoE" components="Input"/>
        <FieldWrapper name="pass_pppoe" label="Pass PPPoE" components="Input"/>
    </div>
    <FieldWrapper name="eth_lock" label="Eth Locks?" components="Checkbox">
  )
}

export function ConfigBatch() {
  return(
      
  )
}
