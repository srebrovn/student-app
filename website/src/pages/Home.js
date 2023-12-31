import { useState, useEffect } from 'react';
import Jumbotron from "../components/Jumbotron";
import Map from "../components/Map";


function Home() {
    const [work, setWork] = useState([]);
    const [bars, setBars] = useState([]);
    const [dorms, setDorms] = useState([]);
    const [events, setEevents] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [wifis, setWifis] = useState([]);


    useEffect(function () {
        const getWork = async function () {
            const res = await fetch(process.env.REACT_APP_mainAPIurl + "/studentWork");
            const data = await res.json();
            setWork(data)
        }
        getWork()
    }, []);

    useEffect(function () {
        const getBars = async function () {
            const res = await fetch(process.env.REACT_APP_mainAPIurl + "/bars");
            const data = await res.json();
            setBars(data);
        }
        getBars()
    }, []);
    useEffect(function () {
        const getDorms = async function () {
            const res = await fetch(process.env.REACT_APP_mainAPIurl + "/dorms");
            const data = await res.json();
            setDorms(data);
        }
        getDorms()
    }, []);
    useEffect(function () {
        const getEvents = async function () {
            const res = await fetch(process.env.REACT_APP_mainAPIurl + "/events");
            const data = await res.json();
            setEevents(data);
        }
        getEvents()
    }, []);
    useEffect(function () {
        const getFaculties = async function () {
            const res = await fetch(process.env.REACT_APP_mainAPIurl + "/faculties");
            const data = await res.json();
            setFaculties(data);
        }
        getFaculties()
    }, []);
    useEffect(function () {
        const getRestaurants = async function () {
            const res = await fetch(process.env.REACT_APP_mainAPIurl + "/restaurants");
            const data = await res.json();
            setRestaurants(data);
        }
        getRestaurants()
    }, []);
    useEffect(function () {
        const getWifi = async function () {
            const res = await fetch(process.env.REACT_APP_mainAPIurl + "/wifi/wifiSpeeds");
            const data = await res.json();
            setWifis(data);
        }
        getWifi()
    }, []);
    if (work === undefined || bars === undefined || dorms === undefined ||
        events === undefined || faculties === undefined ||
        restaurants === undefined || wifis === undefined) {
        return <></>
    }
    return (<>

        <Map work={work} bars={bars} dorms={dorms} events={events} faculties={faculties} restaurants={restaurants} wifis={wifis} />

        <Jumbotron title="Iščeš študentsko Delo !?"
            description="Za tvoje delo poskrbimo mi. Pri nas najdeš najširšo ponudbo študentskega dela iz različnih virov."
            prompt="Poglej si vse ponudbe študentskega dela"
            url="/studentWork"
            bgcolor="greenBackground"
            textColor="white"
            textOrient="left"
        />
        <Jumbotron title="Si lačen ? "
            description="Poišči restavracije v svoji bližini"
            promp="Imamo vse restavracije na bone"
            url="/restaurants"
            bgcolor="darkBackground"
            textColor="white"
            textOrient="right"
        />
        <Jumbotron title="Grema na kavo ?"
            description="Poišči kavarne v svoji bližini"
            promp="Vse kavarne v mariboru"
            url="/bars"
            bgcolor="secondaryBackground"
            textColor="dark"
            textOrient="left"
        />


    </>


    )
}
export default Home;