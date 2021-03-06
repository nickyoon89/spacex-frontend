import { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Typography,
  FormControlLabel,
  TextField,
  IconButton,
  Button
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { GridColDef } from "@mui/x-data-grid";
import SpacexDispCard from "./components/spacex-disp-card/spacex-disp-card.component";
import SpacexDispGrid from "./components/spacex-disp-grid/spacex-disp-grid.component";
import SpacexInputSelect from "./components/spacex-input-select/spacex-input-select.component";

import { gql, useQuery } from "@apollo/client";
import "./App.css";

function App() {
  const [apolloData, setApolloData] = useState({data:Array(0)});  //save data to filter/sort
  const [dispType, setDispType] = useState("card");               //display type (card, grid, json)
  const [sort, setSort] = useState("");                           //sorting method (id, name)
  const [filter, setFilter] = useState({param:'', search:''});    //filtering method (param: id, name, search: string)
  //GRID column def
  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 90 },
    {
      field: "name",
      headerName: "Name",
      width: 150,
    },
    {
      field: "manufacturers",
      headerName: "Manufacturers",
      width: 200,
    },
    {
      field: "description",
      headerName: "Description",
      width: 500,
    },
    {
      field: "twitter",
      headerName: "Twitter",
      width: 200,
    },
    {
      field: "website",
      headerName: "Website",
      width: 200,
    },
    {
      field: "wikipedia",
      headerName: "Wikipedia",
      width: 200,
    },
  ];
  //GraphQL
  const GET_MISSIONS = gql`
    query MissionsQuery($limit: Int, $find: MissionsFind) {
      missionsResult(limit: $limit, find: $find) {
        data{
          id
          name
          description
          manufacturers
          twitter
          website
          wikipedia
        }
        result {
          totalCount
        }
      }
    }
  `;
  const { loading, error, data } = useQuery(GET_MISSIONS);
  useEffect(()=>{ //when data has changed, set apolloData state as well
    if(data) {
      setApolloData(data.missionsResult);
    }
  },[data]);
  if (loading) return <Grid item className="message-grid" xs={12}><Typography variant="h2" color="text.secondary" >LOADING...</Typography></Grid>;
  if (error) return <Grid item className="message-grid" xs={12}><Typography variant="h2" color="text.secondary" >ERROR!</Typography></Grid>;
  function sortingChangeHandler(e:any){
    setSort(e.target.value);
    renewData(e.target.value, false);
  }
  function filterhangeHandler(e:any){
    setFilter({param:e.target.value, search:""});
  }
  function renewData(sort:string, renew:boolean){
    let originalData: {data:Array<any>} = data.missionsResult;
    if(!renew){ //apply sort/filter
      if(filter.param==="name"){
        setApolloData({data:originalData.data.filter(mission => {return mission.name.toLowerCase().includes(filter.search)})})
      }else if(filter.param==="id"){
        setApolloData({data:originalData.data.filter(mission => {return mission.id.toLowerCase().includes(filter.search)})})
      }
      if(sort === "id"){
        setApolloData({data:apolloData.data.slice().sort((a,b) => {return ((a.id > b.id)? 1: -1)})});
      } else if(sort === "name"){
        setApolloData({data:apolloData.data.slice().sort((a,b) => {return ((a.name > b.name)? 1: -1)})});
      } else {
        return false;
      }
    }else { // remove sort/filter
      setApolloData({data:originalData.data});
      setSort("");
      setFilter({param:"", search:""});
    }    
    return true;    
  }
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <Grid className="App" container spacing={2}>
        {/* Option box */}
        <Grid item xs={12} sm={6} md={4}>
          <FormControl> {/* Display Options */}
            <FormLabel>Display Type</FormLabel>
            <RadioGroup
              defaultValue="card"
              onChange={(e) => setDispType(e.target.value)}
            >
              <FormControlLabel value="card" control={<Radio />} label="Card" />
              <FormControlLabel value="grid" control={<Radio />} label="Grid" />
              <FormControlLabel value="json" control={<Radio />} label="JSON" />
            </RadioGroup>
          </FormControl>
          </Grid>
          <Grid item  xs={12} md={4}> {/* Sorting Options + Refresh button */}
          <SpacexInputSelect value={sort} title="Sort" data={[{value:'id', label:'ID'},{value:'name', label:'Name'}]} changeHandler={sortingChangeHandler}></SpacexInputSelect>
          <Button variant="contained" color="success" onClick={()=>renewData("", true)} sx={{width:"100%", marginTop: "10px", height:"56px"}}>Refresh</Button>
        </Grid>
        <Grid item xs={12} md={4}> {/* Filtering Options */}
        <SpacexInputSelect value={filter.param} title="Filter" data={[{value:'id', label:'ID'},{value:'name', label:'Name'}]} changeHandler={filterhangeHandler}></SpacexInputSelect>
        <TextField value={filter.search} onChange={(e)=>setFilter({param:filter.param, search:e.target.value})} id="standard-basic" label="" sx={{marginTop: "10px", width: "calc(100% - 40px)"}}/>
        <IconButton type="submit" aria-label="search" sx={{marginTop: "10px", height:"56px"}} onClick={()=>renewData("", false)}>
          <SearchIcon/>
        </IconButton>
        </Grid>
        {/* No Data Display  */
        apolloData.data.length==0?  <Grid item className="message-grid" xs={12}><Typography variant="h2" color="text.secondary" >NO DATA</Typography></Grid> :
        /* Card Display  */
        dispType === "card" ? (  
          apolloData.data.map((_cardData: any) => (
            <Grid item xs={12} sm={6} md={4} key={_cardData.id}>
              <SpacexDispCard cardData={_cardData} />
            </Grid>
          ))
          /* Grid Display  */
        ) : dispType === "grid" ? (
          <Grid item xs={12}>
            <SpacexDispGrid
              columns={columns}
              rows={apolloData.data}
              pageSize = {[10]}
            ></SpacexDispGrid>
          </Grid>
          /* JSON Display  */
        ) : dispType === "json" ? (
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" sx={{wordBreak:"break-word"}}>
              {JSON.stringify(apolloData, null, "\t")}
            </Typography>
          </Grid>
        ) : null}
      </Grid>
    </Box>
  );
}
export default App;
