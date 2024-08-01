<script lang="ts">
	import type { Point } from '$lib/types';
    import Map from '../components/Map.svelte';

    type State = {
        latitude: string,
        longitude: string,
        points: Point[]
    }
    let my_state = $state<State>({
        latitude: '',
        longitude: '',
        points: []
    });

    function addPoint() {
        const { latitude, longitude } = my_state;
        if (latitude && longitude) {
            my_state.points.push(
                { latitude: parseFloat(latitude), longitude: parseFloat(longitude) }
            );
            my_state.latitude = '';
            my_state.longitude = '';
            console.log(`addpoint, now ${my_state.points.length} long`)
        }
    }
</script>

<style>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px;
    }

    .form {
        margin-bottom: 20px;
    }
</style>

<div class="container">
    <div class="form">
        <input type="text" placeholder="Latitude" bind:value={my_state.latitude}>
        <input type="text" placeholder="Longitude" bind:value={my_state.longitude}>
        <button onclick={addPoint}>Add Point</button>
    </div>
    <Map points={my_state.points} />
</div>
