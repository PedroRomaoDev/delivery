import PropTypes from 'prop-types';

import { AddIcon, TrashIcon } from '../assets/icons';
import AddTaskDialog from './AddTaskDialog';
import Button from './Button';

const Header = ({ subtitle, title }) => {
    return (
        <div className="flex w-full justify-between">
            <div>
                <span className="text-xs font-semibold text-brand-primary">
                    {subtitle}
                </span>
                <h2 className="text-xl font-semibold">{title}</h2>
            </div>
        </div>
    );
};

Header.propTypes = {
    children: PropTypes.node.isRequired,
};

export default Header;
