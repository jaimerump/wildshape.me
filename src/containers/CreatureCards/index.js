import React, { Component } from "react";
import {
  Row
} from 'react-materialize'

import { wildshapedStats } from '../../lib/wildshape'

import Card from '../../components/Card/';
import Grid from "../../components/Grid";

class CreatureCards extends Component {
  state = {
    wildshape: null,
  }

  componentWillMount() {
    const wildshape = wildshapedStats(this.props.character, this.props.creature)
    this.setState({
      wildshape,
    });

  }

  render() {
    let creature = this.state.wildshape;
    console.log("Wildshaped stats:", JSON.stringify(creature, undefined, 2));

    return (
      <Grid>
        <Card>
          <Row><span><strong>Size:</strong> {creature.size}</span></Row>
          <Row><span><strong>Armor Class:</strong> {creature.armor_class}</span></Row>
          <Row><span><strong>Temporary HP:</strong> {creature.tempHP.average} ({creature.tempHP.roll})</span></Row>
          <Row><span><strong>Speed:</strong> {creature.speed_str}</span></Row>
          <hr />
          <table>
            <tbody>
              <tr>{Object.keys(creature.ability_scores).map(key => <th>{key}</th>)}</tr>
              <tr>{Object.values(creature.ability_scores).map(value => <td>{value}</td>)}</tr>
            </tbody>
          </table>
          <hr />

          <Row><span><strong>Saving Throws:</strong> {
            Object.keys(creature.saves).map((key) => {
              let value = creature.saves[key];
              return `${key} ${(value > 0) ? `+${value}` : value}`
            }).join(', ')
          }</span></Row>

          <Row><span><strong>Skills:</strong> {
            Object.keys(creature.skills).map((key) => {
              let value = creature.skills[key];
              return `${key} ${(value > 0) ? `+${value}` : value}`
            }).join(', ')
          }</span></Row>

          <Row><span><strong>Senses:</strong> {creature.sense_str}</span></Row>
          <hr />
          {
            creature.features.map((feature, i) => {
              return <Row key={`${feature.name}-${i}`}><p><strong>{feature.name}</strong> {feature.description}</p></Row>
            })
          }
          {creature.features.length ? <hr /> : ""}
          <Row><h3>Actions</h3></Row>
          {
            creature.actions.map((action, i) => {
              return <Row key={`${action.name}-${i}`}><p><strong>{action.name}</strong> {action.description}</p></Row>
            })
          }
        </Card>
      </Grid>
    );
  }

}

export default CreatureCards;